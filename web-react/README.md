# Notely React workspace

This folder contains the standalone Notely React (Vite + TypeScript) student-workspace UI: dashboard, notebooks, study assistant, planner/tasks, and course materials, with bottom navigation and a mobile-first responsive layout.

It is intentionally separate from the existing apps in this repository:

- `/frontend` — the original static multi-page web app (served by the FastAPI backend)
- `/web` — the Next.js app
- `/api/Android` — the native Jetpack Compose Android app

Nothing in those folders was modified by this addition.

## Run

```bash
npm install
npm run dev     # dev server
npm run build   # production build to dist/
```

The production build (`vite build`) has been verified to complete cleanly.

## Note

This is the presentation-layer Notely design. It uses in-memory React state for its screens and does not yet call the AI Notebook REST API (`/api/auth/*`, `/api/stats`, `/api/tools/*`); wiring it to the existing backend is a follow-up task.
