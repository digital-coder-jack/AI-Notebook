"""Centralized server-side AI tier routing.

The public product exposes three product tiers, not upstream provider details:

* ``default`` -> AI Notebook -> Gemini
* ``pro`` -> AI Notebook Pro -> OpenRouter
* ``pro_max`` -> AI Notebook Pro Max -> Cerebras

Every tier is independent. A failed tier never silently consumes another tier's
quota. Credentials, provider names, model IDs, upstream status codes, and
upstream error bodies stay inside this module and its server logs.
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import time
from typing import AsyncGenerator

import httpx

logger = logging.getLogger("ai-notebook.providers")

# Centralized configuration. Model IDs are read once here and nowhere else.
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_MODEL = os.environ.get("OPENROUTER_MODEL", "openrouter/free")
CEREBRAS_BASE_URL = "https://api.cerebras.ai/v1"
CEREBRAS_MODEL = os.environ.get("CEREBRAS_MODEL", "llama-3.3-70b")

TIER_CONFIG: dict[str, dict[str, str]] = {
    "default": {
        "display_name": "AI Notebook",
        "provider": "gemini",
        "env": "GEMINI_API_KEY",
        "model_env": "GEMINI_MODEL",
        "model": GEMINI_MODEL,
    },
    "pro": {
        "display_name": "AI Notebook Pro",
        "provider": "openrouter",
        "env": "OPENROUTER_API_KEY",
        "model_env": "OPENROUTER_MODEL",
        "model": OPENROUTER_MODEL,
    },
    "pro_max": {
        "display_name": "AI Notebook Pro Max",
        "provider": "cerebras",
        "env": "CEREBRAS_API_KEY",
        "model_env": "CEREBRAS_MODEL",
        "model": CEREBRAS_MODEL,
    },
}
VALID_SELECTIONS = ["auto", "default", "pro", "pro_max"]
_LEGACY_SELECTIONS = {"ai_notebook": "default", "ai_notebook_light": "default"}

_NOT_CONFIGURED = {
    "default": "AI Notebook is not responding right now. Please try again.",
    "pro": "AI Notebook Pro is temporarily unavailable. Please try again.",
    "pro_max": "AI Notebook Pro Max is temporarily unavailable. Please try again.",
}

_STREAM_TOTAL_TIMEOUT = int(os.environ.get("AI_STREAM_TIMEOUT", "75"))
_STREAM_IDLE_TIMEOUT = int(os.environ.get("AI_STREAM_IDLE_TIMEOUT", "20"))
_CACHE: dict[str, tuple[float, str]] = {}
_CACHE_TTL = int(os.environ.get("AI_CACHE_TTL", "900"))
_CACHE_MAX = 256


def _normalize_selection(selection: str | None) -> str:
    choice = (selection or "auto").strip().lower()
    choice = _LEGACY_SELECTIONS.get(choice, choice)
    return "default" if choice == "auto" else choice if choice in TIER_CONFIG else "default"


def _tier(tier: str | None) -> dict[str, str]:
    return TIER_CONFIG[_normalize_selection(tier)]


def tier_display_name(tier: str | None) -> str:
    return _tier(tier)["display_name"]


def provider_key(tier: str | None = "default") -> str:
    config = _tier(tier)
    return os.environ.get(config["env"], "").strip()


def provider_available(tier: str | None = "default") -> bool:
    return bool(provider_key(tier))


def available_tiers() -> list[str]:
    return [tier for tier in TIER_CONFIG if provider_available(tier)]


def resolve_order(selection: str | None) -> list[str]:
    """Resolve one selected tier; this intentionally never downgrades."""
    return [_normalize_selection(selection)]


def status_snapshot() -> dict:
    """Return only safe product-tier availability information."""
    tiers = [
        {
            "id": tier,
            "label": config["display_name"],
            "configured": provider_available(tier),
        }
        for tier, config in TIER_CONFIG.items()
    ]
    available = any(item["configured"] for item in tiers)
    return {
        "available": available,
        "name": "AI Notebook",
        "providers": tiers,
        "tiers": tiers,
        "any_configured": available,
    }


def _cache_key(tier: str, messages: list[dict], temperature: float, max_tokens: int) -> str:
    raw = json.dumps(
        {"tier": tier, "m": messages, "t": temperature, "k": max_tokens},
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _cache_get(key: str) -> str | None:
    hit = _CACHE.get(key)
    if not hit:
        return None
    timestamp, value = hit
    if time.time() - timestamp > _CACHE_TTL:
        _CACHE.pop(key, None)
        return None
    return value


def _cache_set(key: str, value: str) -> None:
    if len(_CACHE) >= _CACHE_MAX:
        oldest = min(_CACHE, key=lambda item: _CACHE[item][0])
        _CACHE.pop(oldest, None)
    _CACHE[key] = (time.time(), value)


def _timeout() -> httpx.Timeout:
    return httpx.Timeout(connect=8.0, read=30.0, write=8.0, pool=8.0)


def _openai_headers(key: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def _openai_payload(model: str, messages: list[dict], temperature: float, max_tokens: int, stream: bool) -> dict:
    return {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": stream,
    }


def _gemini_contents(messages: list[dict]) -> tuple[list[dict], dict | None]:
    contents: list[dict] = []
    system_parts: list[dict] = []
    for message in messages:
        role = message.get("role", "user")
        text = str(message.get("content", ""))
        if not text:
            continue
        if role == "system":
            system_parts.append({"text": text})
            continue
        contents.append({"role": "model" if role == "assistant" else "user", "parts": [{"text": text}]})
    system = {"parts": system_parts} if system_parts else None
    return contents, system


def _gemini_payload(messages: list[dict], temperature: float, max_tokens: int, stream: bool = False) -> dict:
    contents, system = _gemini_contents(messages)
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens,
        },
    }
    if system:
        payload["systemInstruction"] = system
    return payload


def _generic_error(tier: str, error_type: str = "unavailable") -> dict:
    return {"type": error_type, "message": _NOT_CONFIGURED[tier]}


def _log_upstream_failure(tier: str, status: int | None = None, error_type: str = "failure") -> None:
    # Deliberately log only safe identifiers and status metadata; never keys or
    # upstream response bodies.
    logger.warning("tier=%s upstream_failure type=%s status=%s", tier, error_type, status)


def _parse_openai_response(data: dict) -> str:
    value = data["choices"][0]["message"]["content"]
    if isinstance(value, list):
        value = "".join(str(item.get("text", "")) if isinstance(item, dict) else str(item) for item in value)
    return str(value or "").strip()


def _parse_gemini_response(data: dict) -> str:
    parts = data["candidates"][0]["content"]["parts"]
    return "".join(str(part.get("text", "")) for part in parts if isinstance(part, dict)).strip()


async def _complete_tier(
    tier: str, messages: list[dict], temperature: float, max_tokens: int
) -> str:
    config = _tier(tier)
    key = provider_key(tier)
    if not key:
        raise RuntimeError("not_configured")

    async with httpx.AsyncClient(timeout=_timeout()) as client:
        if config["provider"] == "gemini":
            url = f"{GEMINI_BASE_URL}/models/{config['model']}:generateContent"
            response = await client.post(url, params={"key": key}, json=_gemini_payload(messages, temperature, max_tokens))
        else:
            base = OPENROUTER_BASE_URL if config["provider"] == "openrouter" else CEREBRAS_BASE_URL
            response = await client.post(
                f"{base}/chat/completions",
                json=_openai_payload(config["model"], messages, temperature, max_tokens, False),
                headers=_openai_headers(key),
            )

    if response.status_code != 200:
        _log_upstream_failure(tier, response.status_code, "http")
        raise RuntimeError("upstream_http")
    try:
        data = response.json()
        text = _parse_gemini_response(data) if config["provider"] == "gemini" else _parse_openai_response(data)
    except (ValueError, KeyError, IndexError, TypeError):
        _log_upstream_failure(tier, error_type="invalid_response")
        raise RuntimeError("invalid_response")
    if not text:
        _log_upstream_failure(tier, error_type="empty_response")
        raise RuntimeError("empty_response")
    return text


async def chat(
    messages: list[dict], *, selection: str | None = "auto", temperature: float = 0.7,
    max_tokens: int = 1024, use_cache: bool = True,
) -> tuple[str, str]:
    tier = _normalize_selection(selection)
    if not provider_available(tier):
        return (tier, _NOT_CONFIGURED[tier])
    cache_key = _cache_key(tier, messages, temperature, max_tokens)
    if use_cache:
        cached = _cache_get(cache_key)
        if cached is not None:
            return (tier, cached)
    try:
        text = await _complete_tier(tier, messages, temperature, max_tokens)
        if use_cache:
            _cache_set(cache_key, text)
        return (tier, text)
    except httpx.TimeoutException as exc:
        _log_upstream_failure(tier, error_type=type(exc).__name__)
    except httpx.RequestError as exc:
        _log_upstream_failure(tier, error_type=type(exc).__name__)
    except Exception as exc:  # noqa: BLE001
        if str(exc) not in {"not_configured", "upstream_http", "invalid_response", "empty_response"}:
            _log_upstream_failure(tier, error_type=type(exc).__name__)
    return (tier, _NOT_CONFIGURED[tier])


async def _stream_tier(
    tier: str, messages: list[dict], temperature: float, max_tokens: int,
    cancel_event: "asyncio.Event | None",
) -> AsyncGenerator[str, None]:
    config = _tier(tier)
    key = provider_key(tier)
    if not key:
        raise RuntimeError("not_configured")
    timeout = httpx.Timeout(connect=8.0, read=_STREAM_IDLE_TIMEOUT, write=8.0, pool=8.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        if config["provider"] == "gemini":
            url = f"{GEMINI_BASE_URL}/models/{config['model']}:streamGenerateContent"
            request = client.stream(
                "POST", url, params={"alt": "sse", "key": key},
                json=_gemini_payload(messages, temperature, max_tokens, True),
            )
        else:
            base = OPENROUTER_BASE_URL if config["provider"] == "openrouter" else CEREBRAS_BASE_URL
            request = client.stream(
                "POST", f"{base}/chat/completions",
                json=_openai_payload(config["model"], messages, temperature, max_tokens, True),
                headers=_openai_headers(key),
            )
        async with request as response:
            if response.status_code != 200:
                await response.aread()
                _log_upstream_failure(tier, response.status_code, "http")
                raise RuntimeError("upstream_http")
            line_iter = response.aiter_lines().__aiter__()
            deadline = time.monotonic() + _STREAM_TOTAL_TIMEOUT
            while True:
                if cancel_event is not None and cancel_event.is_set():
                    return
                if time.monotonic() > deadline:
                    raise httpx.ReadTimeout("stream deadline")
                try:
                    line = await asyncio.wait_for(line_iter.__anext__(), timeout=_STREAM_IDLE_TIMEOUT)
                except StopAsyncIteration:
                    return
                except asyncio.TimeoutError as exc:
                    raise httpx.ReadTimeout("stream idle timeout") from exc
                line = line.strip()
                if not line or not line.startswith("data:"):
                    continue
                raw = line[5:].strip()
                if raw == "[DONE]":
                    return
                try:
                    chunk = json.loads(raw)
                except json.JSONDecodeError:
                    continue
                if chunk.get("error"):
                    raise RuntimeError("upstream_stream_error")
                try:
                    if config["provider"] == "gemini":
                        token = _parse_gemini_response(chunk)
                    else:
                        token = chunk["choices"][0]["delta"].get("content") or ""
                except (KeyError, IndexError, TypeError):
                    continue
                if token:
                    yield str(token)


async def chat_stream(
    messages: list[dict], *, selection: str | None = "auto", temperature: float = 0.7,
    max_tokens: int = 1024, cancel_event: "asyncio.Event | None" = None,
) -> AsyncGenerator[tuple[str, str], None]:
    """Stream exactly one selected tier; never concatenate another tier."""
    tier = _normalize_selection(selection)
    if not provider_available(tier):
        yield ("error", _generic_error(tier, "not_configured"))
        return
    if cancel_event is not None and cancel_event.is_set():
        yield ("cancelled", "cancelled before start")
        return

    produced = False
    try:
        async for token in _stream_tier(tier, messages, temperature, max_tokens, cancel_event):
            if not produced:
                produced = True
                yield ("meta", TIER_CONFIG[tier]["display_name"])
            yield ("token", token)
        if not produced and cancel_event is not None and cancel_event.is_set():
            yield ("cancelled", "superseded by a newer request")
        elif not produced:
            _log_upstream_failure(tier, error_type="empty_stream")
            yield ("error", _generic_error(tier, "empty_stream"))
    except httpx.TimeoutException as exc:
        _log_upstream_failure(tier, error_type=type(exc).__name__)
        if not produced:
            yield ("error", _generic_error(tier, "timeout"))
    except httpx.RequestError as exc:
        _log_upstream_failure(tier, error_type=type(exc).__name__)
        if not produced:
            yield ("error", _generic_error(tier, "network"))
    except Exception as exc:  # noqa: BLE001
        if str(exc) in {"not_configured", "upstream_http", "invalid_response", "empty_response", "upstream_stream_error"}:
            _log_upstream_failure(tier, error_type=str(exc))
        else:
            _log_upstream_failure(tier, error_type=type(exc).__name__)
        if not produced:
            yield ("error", _generic_error(tier))


# Compatibility wrappers retained for older imports. They use the default tier.
async def groq_chat(messages: list[dict], **kwargs) -> str:
    _tier_id, text = await chat(messages, selection=kwargs.pop("selection", "default"), **kwargs)
    return text


async def groq_chat_stream(messages: list[dict], **kwargs):
    async for event, value in chat_stream(messages, selection=kwargs.pop("selection", "default"), **kwargs):
        yield event, value
