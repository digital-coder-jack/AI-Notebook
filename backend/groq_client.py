"""
=====================================================================
 STUDY SPHERE AI  -  backend/groq_client.py
=====================================================================
Thin async wrapper around the Groq Chat Completions API.

Provides both:
  * groq_chat()         -> a single complete answer (string).
  * groq_chat_stream()  -> an async generator yielding text chunks
                           (Server-Sent-Events style token streaming).

The API key is read ONLY from the GROQ_API_KEY environment variable.
=====================================================================
"""

from __future__ import annotations

import json
import logging
import os
from typing import AsyncGenerator

import httpx

logger = logging.getLogger("study-sphere.groq")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")


def _api_key() -> str:
    return os.environ.get("GROQ_API_KEY", "")


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {_api_key()}",
        "Content-Type": "application/json",
    }


async def groq_chat(
    messages: list[dict],
    *,
    temperature: float = 0.7,
    max_tokens: int = 1024,
) -> str:
    """Return a single complete assistant reply for the given messages."""
    if not _api_key():
        return (
            "🤖 AI answers are not configured yet. "
            "Set the GROQ_API_KEY environment variable to enable AI features."
        )

    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(GROQ_API_URL, json=payload, headers=_headers())
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()
    except httpx.HTTPStatusError as exc:
        logger.error("Groq API %s: %s", exc.response.status_code, exc.response.text)
        return "⚠️ The AI service returned an error. Please try again in a moment."
    except Exception:
        logger.exception("Unexpected error while calling Groq API")
        return "⚠️ I couldn't reach the AI service right now. Please try again later."


async def groq_chat_stream(
    messages: list[dict],
    *,
    temperature: float = 0.7,
    max_tokens: int = 1024,
) -> AsyncGenerator[str, None]:
    """
    Stream the assistant reply token-by-token.
    Yields plain text chunks (decoded from the SSE protocol Groq uses).
    """
    if not _api_key():
        yield (
            "🤖 AI answers are not configured yet. "
            "Set the GROQ_API_KEY environment variable to enable AI features."
        )
        return

    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": True,
    }

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream(
                "POST", GROQ_API_URL, json=payload, headers=_headers()
            ) as resp:
                if resp.status_code != 200:
                    body = await resp.aread()
                    logger.error("Groq stream %s: %s", resp.status_code, body)
                    yield "⚠️ The AI service returned an error. Please try again."
                    return

                async for line in resp.aiter_lines():
                    line = line.strip()
                    if not line or not line.startswith("data:"):
                        continue
                    data = line[len("data:"):].strip()
                    if data == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                        delta = chunk["choices"][0]["delta"]
                        token = delta.get("content")
                        if token:
                            yield token
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue
    except Exception:
        logger.exception("Unexpected error while streaming from Groq API")
        yield "\n\n⚠️ The connection to the AI service was interrupted."
