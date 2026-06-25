# Study Sphere API Contract

Base URL: `<BACKEND_HOST>/api`

All requests/responses are JSON. Authenticated endpoints require:

```
Authorization: Bearer <JWT>
```

The same contract is consumed by both the web frontend and the Android app.

---

## Authentication

### POST `/auth/register`
Create an account.

Request:
```json
{ "name": "Alice", "email": "alice@example.com", "password": "secret1" }
```
Response `201`:
```json
{
  "token": "<jwt>",
  "user": {
    "id": "uuid",
    "name": "Alice",
    "email": "alice@example.com",
    "avatarColor": "#5865F2",
    "defaultModelId": "lite-swift",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### POST `/auth/login`
Request:
```json
{ "email": "alice@example.com", "password": "secret1" }
```
Response `200`: same shape as register.

### GET `/auth/me`  *(auth)*
Response `200`:
```json
{ "user": { "id": "uuid", "name": "Alice", "email": "...", "avatarColor": "#5865F2", "defaultModelId": "lite-swift", "createdAt": "..." } }
```

### PATCH `/auth/me`  *(auth)*
Request (any subset):
```json
{ "name": "Alice B.", "defaultModelId": "pro-mentor" }
```
Response `200`: `{ "user": { ... } }`

---

## Models

### GET `/models`  *(auth)*
Returns the dynamic plan/model catalog. **Provider names and keys are never
included.**

Response `200`:
```json
{
  "plans": [
    {
      "name": "Study Sphere Lite",
      "tier": "lite",
      "description": "Fast, everyday study assistance ...",
      "models": [
        { "id": "lite-swift", "name": "Swift", "description": "Quick responses ..." },
        { "id": "lite-scholar", "name": "Scholar", "description": "Balanced reasoning ..." }
      ]
    },
    {
      "name": "Study Sphere Pro",
      "tier": "pro",
      "description": "Advanced reasoning ...",
      "models": [
        { "id": "pro-mentor", "name": "Mentor", "description": "Deep reasoning ..." },
        { "id": "pro-genius", "name": "Genius", "description": "Top-tier tutoring ..." }
      ]
    }
  ]
}
```

---

## Chat

### GET `/chat/sessions`  *(auth)*
Response `200`:
```json
{ "sessions": [ { "id": "uuid", "title": "...", "modelId": "lite-swift", "createdAt": "...", "updatedAt": "..." } ] }
```

### POST `/chat/sessions`  *(auth)*
Request:
```json
{ "modelId": "lite-swift", "title": "New Chat" }
```
Response `201`:
```json
{ "session": { "id": "uuid", "title": "New Chat", "modelId": "lite-swift", "createdAt": "...", "updatedAt": "..." } }
```

### GET `/chat/sessions/{id}`  *(auth)*
Response `200`:
```json
{
  "session": { "id": "uuid", "title": "...", "modelId": "lite-swift", "createdAt": "...", "updatedAt": "..." },
  "messages": [
    { "id": "uuid", "sessionId": "uuid", "role": "user", "content": "...", "modelId": "lite-swift", "createdAt": "..." },
    { "id": "uuid", "sessionId": "uuid", "role": "assistant", "content": "...", "modelId": "lite-swift", "createdAt": "..." }
  ]
}
```

### DELETE `/chat/sessions/{id}`  *(auth)*
Response `204`: empty.

### POST `/chat/sessions/{id}/messages`  *(auth)*
Send a message and receive the AI reply (backend proxies to the provider).

Request:
```json
{ "content": "Explain photosynthesis", "modelId": "lite-swift" }
```
Response `201`:
```json
{
  "userMessage": { "id": "...", "role": "user", "content": "...", "modelId": "lite-swift", "createdAt": "..." },
  "assistantMessage": { "id": "...", "role": "assistant", "content": "...", "modelId": "lite-swift", "createdAt": "..." },
  "session": { "id": "uuid", "title": "...", "modelId": "lite-swift", "createdAt": "...", "updatedAt": "..." }
}
```

---

## Errors

All errors use:
```json
{ "error": "Human-readable message" }
```

| Status | Meaning                          |
|--------|----------------------------------|
| 400    | Validation error                 |
| 401    | Missing/invalid auth token       |
| 404    | Resource not found               |
| 409    | Conflict (e.g. email registered) |
| 429    | Rate limited                     |
| 502    | Upstream AI provider error       |
| 500    | Internal server error            |

## Health

### GET `/health`
Response `200`: `{ "status": "ok", "service": "study-sphere-backend", "time": "..." }`
