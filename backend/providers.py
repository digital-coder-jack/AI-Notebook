"""
AI Notebook provider routing.

NVIDIA NIM exposes an OpenAI-compatible Chat Completions API. This module
keeps the provider boundary centralized so web, native, and study-tool paths
share identical authentication, request, streaming, and fallback behavior.
API keys are read only from the server environment and are never logged or
returned to clients.
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

NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
NVIDIA_ENV = "NVIDIA_API_KEY"
NVIDIA_DEFAULT_MODELS = [
    "nvidia/nemotron-3.5-lightning-30b-a3b",
    "z-ai/glm-5-3-flash",
    "z-ai/glm-5-3",
]

# The public selection remains one provider; Auto uses the ordered model chain.
PROVIDERS: dict[str, dict] = {
    "nvidia": {
        "label": "NVIDIA NIM",
        "env": NVIDIA_ENV,
        "url": NVIDIA_URL,
    }
}
DEFAULT_ORDER = ["nvidia"]
VALID_SELECTIONS = ["auto", "nvidia"]


def _configured_models() -> list[str]:
    """Read the ordered NVIDIA model chain from server-side environment."""
    keys = (
        "NVIDIA_MODEL_PRIMARY",
        "NVIDIA_MODEL_FALLBACK_1",
        "NVIDIA_MODEL_FALLBACK_2",
    )
    models = [os.environ.get(key, default).strip() for key, default in zip(keys, NVIDIA_DEFAULT_MODELS)]
    return [model for model in models if model]


def provider_key(name: str = "nvidia") -> str:
    if name not in PROVIDERS:
        return ""
    return os.environ.get(PROVIDERS[name]["env"], "").strip()


def provider_available(name: str = "nvidia") -> bool:
    return name in PROVIDERS and bool(provider_key(name))


def available_providers() -> list[str]:
    return [name for name in DEFAULT_ORDER if provider_available(name)]


def resolve_order(selection: str | None) -> list[str]:
    """Return the ordered model IDs to try for this request."""
    choice = (selection or "auto").lower()
    if choice not in VALID_SELECTIONS:
        choice = "auto"
    if not provider_available("nvidia"):
        return []
    # A manual NVIDIA selection and Auto both use the same safe model chain.
    return _configured_models()


def status_snapshot() -> dict:
    """Return provider/model status without exposing secrets."""
    configured = provider_available("nvidia")
    models = _configured_models()
    return {
        "providers": [
            {
                "id": "nvidia",
                "label": "NVIDIA NIM",
                "configured": configured,
                "model": models[0] if models else NVIDIA_DEFAULT_MODELS[0],
                "fallback_models": models[1:],
            }
        ],
        "order": DEFAULT_ORDER,
        "models": models,
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
    }


def _payload(model: str, messages: list[dict], temperature: float, max_tokens: int, *, stream: bool = False) -> dict:
    return {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": stream,
    }

_NOT_CONFIGURED = (
    "AI Notebook is getting ready. Please try again in a moment."
)
_ALL_FAILED = (
    "AI Notebook isn't responding right now. Please try again in a moment."
)
_AUTH_FAILED = (
    "AI Notebook isn't responding right now. Please try again in a moment."
)


def _http_error(status: int, model: str) -> dict:
    if status in (401, 403):
        return {"type": "auth", "message": _AUTH_FAILED, "status": status}
    if status == 429:
        return {"type": "http", "message": "AI Notebook is temporarily busy", "status": status}
    if 500 <= status <= 599:
        return {"type": "http", "message": _ALL_FAILED, "status": status}
    return {"type": "http", "message": _ALL_FAILED, "status": status}


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
            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(
                    NVIDIA_URL,
                    json=_payload(model, messages, temperature, max_tokens),
                    headers=_headers(),
                )
            if resp.status_code != 200:
                last_error = _http_error(resp.status_code, model)
                logger.warning("provider=nvidia model=%s status=%s", model, resp.status_code)
                if resp.status_code in (401, 403):
                    break
                continue
            try:
                data = resp.json()
                text = data["choices"][0]["message"]["content"].strip()
            except (ValueError, KeyError, IndexError, TypeError):
                last_error = {"type": "invalid_response", "message": f"{model} returned an invalid response"}
                logger.warning("provider=nvidia model=%s invalid_response", model)
                continue
            if text:
                if use_cache:
                    _cache_set(key, text)
                logger.info("provider=nvidia model=%s completion_succeeded", model)
                return ("nvidia", text)
            last_error = {"type": "invalid_response", "message": f"{model} returned an empty response"}
        except (httpx.ConnectError, httpx.ConnectTimeout) as exc:
            last_error = {"type": "network", "message": "Could not reach NVIDIA AI"}
            logger.warning("provider=nvidia model=%s network_error=%s", model, type(exc).__name__)
        except httpx.ReadTimeout:
            last_error = {"type": "timeout", "message": "NVIDIA AI request timed out"}
            logger.warning("provider=nvidia model=%s timeout", model)
        except Exception as exc:  # noqa: BLE001
            last_error = {"type": "network", "message": "NVIDIA AI request failed"}
            logger.warning("provider=nvidia model=%s error=%s", model, type(exc).__name__)
    logger.error("provider=nvidia all_models_failed last_type=%s last_status=%s", (last_error or {}).get("type"), (last_error or {}).get("status"))
    return ("error", (last_error or {}).get("message", _ALL_FAILED))


_STREAM_TOTAL_TIMEOUT = int(os.environ.get("AI_STREAM_TIMEOUT", "120"))
_STREAM_IDLE_TIMEOUT = int(os.environ.get("AI_STREAM_IDLE_TIMEOUT", "30"))


async def chat_stream(
    messages: list[dict], *, selection: str | None = "auto", temperature: float = 0.7,
    max_tokens: int = 1024, cancel_event: "asyncio.Event | None" = None,
) -> AsyncGenerator[tuple[str, str], None]:
    """Yield meta/token/error events while trying each NVIDIA model once."""
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
            timeout = httpx.Timeout(connect=15.0, read=_STREAM_IDLE_TIMEOUT, write=15.0, pool=15.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream(
                    "POST", NVIDIA_URL,
                    json=_payload(model, messages, temperature, max_tokens, stream=True),
                    headers=_headers(),
                ) as resp:
                    if resp.status_code != 200:
                        await resp.aread()
                        last_error = _http_error(resp.status_code, model)
                        logger.warning("provider=nvidia model=%s status=%s", model, resp.status_code)
                        if resp.status_code in (401, 403):
                            break
                        continue
                    line_iter = resp.aiter_lines().__aiter__()
                    while True:
                        if cancel_event is not None and cancel_event.is_set():
                            yield ("cancelled", "superseded by a newer request")
                            return
                        if time.monotonic() > deadline:
                            last_error = {"type": "timeout", "message": f"{model} exceeded time budget"}
                            break
                        try:
                            line = await asyncio.wait_for(line_iter.__anext__(), timeout=_STREAM_IDLE_TIMEOUT)
                        except StopAsyncIteration:
                            break
                        except asyncio.TimeoutError:
                            last_error = {"type": "timeout", "message": f"{model} stalled"}
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
                            break
                        try:
                            token = chunk["choices"][0]["delta"].get("content")
                        except (KeyError, IndexError, TypeError):
                            continue
                        if token:
                            if not produced:
                                produced = True
                                yield ("meta", "nvidia")
                            yield ("token", token)
            if produced:
                logger.info("provider=nvidia model=%s stream_succeeded", model)
                return
        except (httpx.ConnectError, httpx.ConnectTimeout) as exc:
            last_error = {"type": "network", "message": "Could not reach NVIDIA AI"}
            logger.warning("provider=nvidia model=%s network_error=%s", model, type(exc).__name__)
        except httpx.ReadTimeout:
            last_error = {"type": "timeout", "message": "NVIDIA AI request timed out"}
            logger.warning("provider=nvidia model=%s timeout", model)
        except Exception as exc:  # noqa: BLE001
            last_error = {"type": "network", "message": "NVIDIA AI request failed"}
            logger.warning("provider=nvidia model=%s error=%s", model, type(exc).__name__)
        if produced:
            return
    logger.error("provider=nvidia all_models_stream_failed last_type=%s last_status=%s", (last_error or {}).get("type"), (last_error or {}).get("status"))
    yield ("error", last_error or {"type": "unavailable", "message": _ALL_FAILED})


# Backward-compatible convenience wrapper used by older callers.
async def groq_chat(messages: list[dict], **kwargs) -> str:
    _provider, text = await chat(messages, **kwargs)
    return text


async def groq_chat_stream(messages: list[dict], **kwargs):
    async for event, value in chat_stream(messages, **kwargs):
        yield event, value
