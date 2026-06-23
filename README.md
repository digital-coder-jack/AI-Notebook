# AI Chat — ChatGPT-style Streaming Chat App

A modern, minimal, mobile-responsive AI chat application built with **Next.js (App Router)**, **Tailwind CSS**, and **Zustand**. Responses stream in real time with full Markdown + code rendering, multiple chat sessions, model selection, and robust streaming control (single active stream per chat, `AbortController` cancellation, race-condition-safe state updates).

> Works out of the box with a built-in **mock streaming generator** — no API key required. Set `OPENAI_API_KEY` (starting with `sk-`) to stream real responses from OpenAI.

---

## ✨ Features

- **Create new chat** & **switch between chats** (sidebar with rename/delete)
- **Streaming assistant responses** rendered token-by-token (SSE over `fetch` + `ReadableStream`)
- **Stop** generation mid-stream and **Regenerate** any answer
- **Copy** / **Share** messages (uses Web Share API with clipboard fallback)
- **Model selector** dropdown (GPT-4o, GPT-4o mini, Claude 3.5, Llama 3.1)
- **Loading indicator** (typing dots + streaming cursor + sidebar spinner)
- **Auto-scroll** to latest message (with a "jump to bottom" button when scrolled up)
- **Markdown rendering** with syntax-highlighted, copyable code blocks
- **Persistent** chat history via `localStorage` (Zustand `persist`)
- Clean, **ChatGPT-like dark UI**, fully **mobile responsive**, smooth animations

---

## 🧩 Tech Stack

| Concern            | Choice                                  |
| ------------------ | --------------------------------------- |
| Framework          | Next.js 14 (App Router, Route Handlers) |
| Language           | TypeScript                              |
| Styling            | Tailwind CSS                            |
| State management   | Zustand (+ `persist` middleware)        |
| Markdown           | react-markdown + remark-gfm             |
| Code highlighting  | react-syntax-highlighter (Prism)        |
| Icons              | lucide-react                            |
| Streaming          | `fetch` + `ReadableStream` (SSE frames) |

---

## 📁 Folder Structure

```
ai-chat/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts        # Streaming endpoint (SSE). Mock + OpenAI provider.
│   │   ├── globals.css             # Tailwind + markdown/scrollbar styles
│   │   ├── layout.tsx              # Root layout (dark theme, metadata, viewport)
│   │   └── page.tsx                # App shell: hydration, ensures active chat
│   │
│   ├── components/
│   │   ├── Sidebar.tsx             # Sessions list: new/switch/rename/delete
│   │   ├── ChatWindow.tsx          # Header + message list + composer wiring
│   │   ├── MessageList.tsx         # Auto-scroll + "jump to bottom"
│   │   ├── MessageItem.tsx         # Bubble + copy/share/regenerate actions
│   │   ├── MessageInput.tsx        # Auto-resize textarea + send/stop button
│   │   ├── ModelSelector.tsx       # Model dropdown
│   │   ├── Markdown.tsx            # Markdown + copyable code blocks
│   │   └── EmptyState.tsx          # Welcome screen + suggestion prompts
│   │
│   ├── store/
│   │   └── chatStore.ts            # Zustand store (sessions, streaming control)
│   │
│   └── lib/
│       ├── types.ts                # Message/ChatSession/Model types
│       ├── streamChat.ts           # Client-side stream consumer
│       └── useChat.ts              # send / stop / regenerate lifecycle hook
│
├── next.config.mjs                 # Headers (CORS / framing for preview)
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🧠 State Management Approach (Zustand)

The single source of truth is `src/store/chatStore.ts`:

- `sessions: ChatSession[]` and `activeChatId` are **persisted** to `localStorage`.
- `streamingMap: Record<chatId, boolean>` is **transient** (never persisted) and tracks which chats have an in-flight stream.
- **`AbortController`s live outside the store** (in a `Map<chatId, AbortController>`) because they aren't serializable.

### Streaming correctness guarantees

1. **One active stream per chat** — `registerController(chatId, controller)` aborts any previous controller for that chat before storing the new one.
2. **Cancel previous request** — `AbortController` is passed into `fetch`; `stop()` / deleting a chat calls `abortStream(chatId)`.
3. **No race conditions** — all message writes use **functional updates** (`set(state => …)`), so overlapping streamed chunks never clobber each other. Each stream is bound to a captured `chatId`, so chunks always land in the correct conversation even if the user switches chats mid-stream.
4. **UI synced with backend `chatId`** — the page waits for Zustand rehydration before rendering and always ensures a valid `activeChatId` exists.

---

## 🌊 Streaming Implementation

**Server** (`src/app/api/chat/route.ts`): returns a `ReadableStream` emitting SSE frames:

```
data: {"delta":"some text"}\n\n
...
data: [DONE]\n\n
```

If `OPENAI_API_KEY` (starting with `sk-`) is present it proxies OpenAI's streaming `chat/completions`; otherwise it uses a realistic token-by-token mock generator.

**Client** (`src/lib/streamChat.ts`): reads `res.body.getReader()`, decodes, splits on `\n\n`, parses each `data:` frame, and calls `onChunk(delta)`. Aborting the `fetch` rejects the read loop and is handled as a clean stop.

---

## 🚀 Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
```

Optional — stream from OpenAI:

```bash
cp .env.example .env
# set OPENAI_API_KEY=sk-...
```

Production build:

```bash
npm run build
npm start
```
