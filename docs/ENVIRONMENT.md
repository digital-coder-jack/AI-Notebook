# Environment Setup Guide

## Prerequisites

| Tool             | Version       |
|------------------|---------------|
| Node.js          | >= 18 (20 LTS recommended) |
| npm              | >= 9          |
| JDK              | 17            |
| Android Studio   | Hedgehog or newer |
| Android SDK      | API 35, Build-Tools 35.0.0 |
| Kotlin           | 2.0.x (bundled via Gradle) |

---

## Backend Environment Variables

File: `backend/.env` (copy from `backend/.env.example`).

| Variable                  | Description                                              |
|---------------------------|----------------------------------------------------------|
| `PORT`                    | HTTP port (default `8080`)                               |
| `NODE_ENV`                | `development` / `production`                             |
| `JWT_SECRET`              | Long random string used to sign JWTs                     |
| `JWT_EXPIRES_IN`          | Token lifetime, e.g. `7d`                                |
| `CORS_ORIGINS`            | Comma-separated allowed origins                          |
| `LITE_PROVIDER_BASE_URL`  | Base URL of the provider backing the **Lite** plan       |
| `LITE_PROVIDER_API_KEY`   | Secret API key for the Lite provider (**server only**)   |
| `PRO_PROVIDER_BASE_URL`   | Base URL of the provider backing the **Pro** plan        |
| `PRO_PROVIDER_API_KEY`    | Secret API key for the Pro provider (**server only**)    |

> If provider keys are omitted, the backend falls back to a built-in local
> reply generator so the entire stack remains demoable without external keys.

The provider base URLs assume an OpenAI-compatible `/chat/completions`
endpoint. The internal `upstreamModel` mapping is configured in
`backend/src/config/models.js`.

---

## Frontend Environment Variables

File: `frontend/.env.local` (copy from `frontend/.env.example`).

| Variable                   | Description                                       |
|----------------------------|---------------------------------------------------|
| `NEXT_PUBLIC_API_BASE_URL` | Public URL of the backend API, e.g. `https://api.example.com/api` |

This is the **only** value the browser receives. No provider keys are ever
referenced in frontend code or environment.

---

## Android Configuration

The backend URL is compiled into `BuildConfig.API_BASE_URL` in
`android/app/build.gradle.kts`:

- **Debug**: `http://10.0.2.2:8080/api/` (emulator → host localhost)
- **Release**: `https://your-backend.example.com/api/` (edit before shipping)

Android stores only the JWT (via DataStore) and cached chat data (via Room).
No provider keys are ever present on the device.

To point a physical device at a local backend, replace `10.0.2.2` with your
machine's LAN IP and ensure both are on the same network.
