"""
AI Notebook provider routing.

BazaarLink exposes an OpenAI-compatible Chat Completions API. This module is
kept as the single server-side boundary for authentication, timeouts, model
fallback, streaming, and response caching. The API key and model IDs never
leave the backend.
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

BAZAARLINK_BASE_URL = os.environ.get("BAZAARLINK_BASE_URL", "https://api.bazaarlink.ai/v1").rstrip("/")
BAZAARLINK_URL = f"{BAZAARLINK_BASE_URL}/chat/completions"
BAZAARLINK_ENV = "BAZAARLINK_API_KEY"
AI_MODELS = [
    "qwen/qwen3.7-flash",
    "deepseek/deepseek-v4-flash-0731free",
]

# The public product exposes one assistant mode. The gateway and model chain
# are deliberately implementation details.
PROVIDERS: dict[str, dict] = {
    "ai_notebook": {
        "label": "AI Notebook",
        "env": BAZAARLINK_ENV,
        "url": BAZAARLINK_URL,
    }
}
DEFAULT_ORDER = ["ai_notebook"]
VALID_SELECTIONS = ["auto", "ai_notebook"]


def provider_key(name: str = "ai_notebook") -> str:
    if name not in PROVIDERS:
        return ""
    return os.environ.get(PROVIDERS[name]["env"], "").strip()


def provider_available(name: str = "ai_notebook") -> bool:
    return name in PROVIDERS and bool(provider_key(name))


def available_providers() -> list[str]:
    return [name for name in DEFAULT_ORDER if provider_available(name)]


def resolve_order(selection: str | None) -> list[str]:
    """Return the exact free model IDs to try once each, in order."""
    choice = (selection or "auto").lower()
    if choice not in VALID_SELECTIONS:
        choice = "auto"
    return AI_MODELS.copy() if provider_available("ai_notebook") else []


def status_snapshot() -> dict:
    """Return generic AI availability without exposing gateway/model details."""
    configured = provider_available("ai_notebook")
    return {
        "available": configured,
        "provider": "AI Notebook",
        "providers": [
            {
                "id": "ai_notebook",
                "label": "AI Notebook",
                "configured": configured,
            }
        ],
        "order": ["AI Notebook"],
        "models": [],
        "any_configured": configured,
    }


# Simple process-local response cache for non-streaming study-tool calls.
_CACHE: dict[str, tuple[float, str]] = {}
_CACHE_TTL = int(os.environ.get("AI_CACHE_TTL", "900"))
_CACHE_MAX = 256


def _cache_key(order, messages, temperature, max_tokens) -> str:
    raw = json.dumps(
        {"o": order, "m": messages, "t": temperature, "k": max_tokens},
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _cache_get(key: str) -> str | None:
    hit = _CACHE.get(key)
    if not hit:
        return None
    ts, value = hit
    if time.time() - ts > _CACHE_TTL:
        _CACHE.pop(key, None)
        return None
    return value


def _cache_set(key: str, value: str) -> None:
    if len(_CACHE) >= _CACHE_MAX:
        oldest = min(_CACHE, key=lambda k: _CACHE[k][0])
        _CACHE.pop(oldest, None)
    _CACHE[key] = (time.time(), value)


def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {provider_key()}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        # Never allow the gateway to silently route to a paid model.
        "X-Free-Fallback": "false",
    }


def _payload(model: str, messages: list[dict], temperature: float, max_tokens: int, *, stream: bool = False) -> dict:
    return {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": stream,
    }


_NOT_CONFIGURED = "AI Notebook is getting ready. Please try again in a moment."
_ALL_FAILED = "AI Notebook is temporarily unavailable. Please try again later."
_RETRYABLE_STATUS = {401, 403, 408, 429, 500, 502, 503, 504}


def _http_error(status: int) -> dict:
    """Create a generic client-safe error while retaining status for logs."""
    if status == 429:
        message = "AI Notebook is temporarily busy"
    else:
        message = _ALL_FAILED
    return {"type": "http", "message": message, "status": status}


def _request_timeout() -> httpx.Timeout:
    # A dead free model should fail quickly enough for the next model to run.
    return httpx.Timeout(connect=8.0, read=30.0, write=8.0, pool=8.0)


async def chat(
    messages: list[dict], *, selection: str | None = "auto", temperature: float = 0.7,
    max_tokens: int = 1024, use_cache: bool = True,
) -> tuple[str, str]:
    order = resolve_order(selection)
    if not order:
        return ("none", _NOT_CONFIGURED)
    key = _cache_key(order, messages, temperature, max_tokens)
    if use_cache:
        cached = _cache_get(key)
        if cached is not None:
            return ("cache", cached)

    last_error: dict | None = None
    for model in order:
        try:
            async with httpx.AsyncClient(timeout=_request_timeout()) as client:
                resp = await client.post(
                    BAZAARLINK_URL,
                    json=_payload(model, messages, temperature, max_tokens),
                    headers=_headers(),
                )
            if resp.status_code != 200:
                last_error = _http_error(resp.status_code)
                logger.warning("gateway=bazaarlink model=%s status=%s", model, resp.status_code)
                continue
            try:
                data = resp.json()
                text = data["choices"][0]["message"]["content"].strip()
            except (ValueError, KeyError, IndexError, TypeError):
                last_error = {"type": "invalid_response", "message": _ALL_FAILED}
                logger.warning("gateway=bazaarlink model=%s invalid_response", model)
                continue
            if text:
                if use_cache:
                    _cache_set(key, text)
                logger.info("gateway=bazaarlink model=%s completion_succeeded", model)
                return ("ai_notebook", text)
            last_error = {"type": "invalid_response", "message": _ALL_FAILED}
            logger.warning("gateway=bazaarlink model=%s empty_response", model)
        except httpx.TimeoutException as exc:
            last_error = {"type": "timeout", "message": _ALL_FAILED}
            logger.warning("gateway=bazaarlink model=%s timeout=%s", model, type(exc).__name__)
        except httpx.RequestError as exc:
            last_error = {"type": "network", "message": _ALL_FAILED}
            logger.warning("gateway=bazaarlink model=%s network_error=%s", model, type(exc).__name__)
        except Exception as exc:  # noqa: BLE001
            last_error = {"type": "network", "message": _ALL_FAILED}
            logger.warning("gateway=bazaarlink model=%s error=%s", model, type(exc).__name__)

    logger.error(
        "gateway=bazaarlink all_models_failed last_type=%s last_status=%s",
        (last_error or {}).get("type"),
        (last_error or {}).get("status"),
    )
    return ("error", (last_error or {}).get("message", _ALL_FAILED))


_STREAM_TOTAL_TIMEOUT = int(os.environ.get("AI_STREAM_TIMEOUT", "75"))
_STREAM_IDLE_TIMEOUT = int(os.environ.get("AI_STREAM_IDLE_TIMEOUT", "20"))


async def chat_stream(
    messages: list[dict], *, selection: str | None = "auto", temperature: float = 0.7,
    max_tokens: int = 1024, cancel_event: "asyncio.Event | None" = None,
) -> AsyncGenerator[tuple[str, str], None]:
    """Yield generic meta/token/error events while trying each free model once."""
    order = resolve_order(selection)
    if not order:
        yield ("error", {"type": "not_configured", "message": _NOT_CONFIGURED})
        return
    if cancel_event is not None and cancel_event.is_set():
        yield ("cancelled", "cancelled before start")
        return

    deadline = time.monotonic() + _STREAM_TOTAL_TIMEOUT
    last_error: dict | None = None
    for model in order:
        produced = False
        try:
            timeout = httpx.Timeout(connect=8.0, read=_STREAM_IDLE_TIMEOUT, write=8.0, pool=8.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream(
                    "POST",
                    BAZAARLINK_URL,
                    json=_payload(model, messages, temperature, max_tokens, stream=True),
                    headers=_headers(),
                ) as resp:
                    if resp.status_code != 200:
                        await resp.aread()
                        last_error = _http_error(resp.status_code)
                        logger.warning("gateway=bazaarlink model=%s status=%s", model, resp.status_code)
                        continue

                    line_iter = resp.aiter_lines().__aiter__()
                    while True:
                        if cancel_event is not None and cancel_event.is_set():
                            yield ("cancelled", "superseded by a newer request")
                            return
                        if time.monotonic() > deadline:
                            last_error = {"type": "timeout", "message": _ALL_FAILED}
                            logger.warning("gateway=bazaarlink model=%s total_timeout", model)
                            break
                        try:
                            line = await asyncio.wait_for(
                                line_iter.__anext__(), timeout=_STREAM_IDLE_TIMEOUT
                            )
                        except StopAsyncIteration:
                            break
                        except asyncio.TimeoutError:
                            last_error = {"type": "timeout", "message": _ALL_FAILED}
                            logger.warning("gateway=bazaarlink model=%s idle_timeout", model)
                            break
                        line = line.strip()
                        if not line or not line.startswith("data:"):
                            continue
                        data = line[len("data:"):].strip()
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                        except json.JSONDecodeError:
                            continue
                        if chunk.get("error"):
                            last_error = {"type": "provider_error", "message": _ALL_FAILED}
                            logger.warning("gateway=bazaarlink model=%s stream_error", model)
                            break
                        try:
                            token = chunk["choices"][0]["delta"].get("content")
                        except (KeyError, IndexError, TypeError):
                            continue
                        if token:
                            if not produced:
                                produced = True
                                # Never expose the gateway/model to clients.
                                yield ("meta", "AI Notebook")
                            yield ("token", token)

            # A clean stream with no meaningful token is eligible for fallback.
            if produced:
                logger.info("gateway=bazaarlink model=%s stream_succeeded", model)
                return
        except httpx.TimeoutException as exc:
            last_error = {"type": "timeout", "message": _ALL_FAILED}
            logger.warning("gateway=bazaarlink model=%s timeout=%s", model, type(exc).__name__)
        except httpx.RequestError as exc:
            last_error = {"type": "network", "message": _ALL_FAILED}
            logger.warning("gateway=bazaarlink model=%s network_error=%s", model, type(exc).__name__)
        except Exception as exc:  # noqa: BLE001
            last_error = {"type": "network", "message": _ALL_FAILED}
            logger.warning("gateway=bazaarlink model=%s error=%s", model, type(exc).__name__)

        # If tokens were already delivered, never append a second model stream.
        if produced:
            return

    logger.error(
        "gateway=bazaarlink all_models_stream_failed last_type=%s last_status=%s",
        (last_error or {}).get("type"),
        (last_error or {}).get("status"),
    )
    yield ("error", last_error or {"type": "unavailable", "message": _ALL_FAILED})


# Backward-compatible convenience wrappers used by older callers.
async def groq_chat(messages: list[dict], **kwargs) -> str:
    _provider, text = await chat(messages, **kwargs)
    return text


async def groq_chat_stream(messages: list[dict], **kwargs):
    async for event, value in chat_stream(messages, **kwargs):
        yield event, value
