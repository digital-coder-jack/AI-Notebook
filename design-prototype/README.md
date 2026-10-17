# AI Notebook — Figma Design Prototype

This directory contains the Figma-imported redesign prototype built with
Vite + React + TypeScript + Tailwind CSS. It was generated in a separate
Bolt workspace and pushed here for review and integration.

## Status

This is a **static UI prototype only**. It uses hardcoded sample data and
is **not** connected to the existing application's:

- FastAPI backend (`backend/`)
- Authentication (`backend/auth.py`, `backend/routes/users.py`)
- AI provider integrations (`backend/providers.py`, `backend/ai.py`)
- SQLite database (`backend/database.py`)
- Telegram bot (`telegram_bot/`)
- Android app (`api/Android/`)
- Deployment configuration (`render.yaml`, `railway.json`, `vercel.json`)

## Purpose

The design and component structure here are intended to inform a future
integration into the existing `frontend/` directory. This prototype should
**not** replace the existing application. It is isolated here so the
existing application on `main` remains fully functional.

## Running locally

```bash
cd design-prototype
npm install
npm run dev
```

## Integration plan

1. Adapt the design tokens, layout, and components from this prototype
   to the existing `frontend/` architecture (vanilla JS + HTML + CSS).
2. Preserve all existing API routes, auth flows, AI provider config,
   database logic, and deployment configuration.
3. Wire the adapted UI to real application data via the existing
   `frontend/js/app.js` API client and `window.SS_API_BASE`.
4. Do not create a duplicate application or a second backend.

## Branch

This prototype lives on `design/figma-prototype-integration`, branched
from `main`. No merge to `main` has been performed.
