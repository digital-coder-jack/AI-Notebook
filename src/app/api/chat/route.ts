import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IncomingMessage {
  role: string;
  content: string;
}

/**
 * Streaming chat endpoint.
 *
 * Emits Server-Sent-Events style frames:
 *   data: {"delta":"some text"}\n\n
 *   ...
 *   data: [DONE]\n\n
 *
 * Replace `generateReply` with a real LLM provider (OpenAI, Anthropic, etc.).
 * If process.env.OPENAI_API_KEY is set, it will stream from OpenAI;
 * otherwise it falls back to a built-in mock generator so the app works
 * out of the box with zero configuration.
 */
export async function POST(req: NextRequest) {
  const { messages, model } = (await req.json()) as {
    messages: IncomingMessage[];
    model: string;
  };

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const prompt = lastUser?.content ?? "";

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (delta: string) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`)
        );
      };

      try {
        // Only hit OpenAI when a real-looking key is configured.
        const key = process.env.OPENAI_API_KEY;
        if (key && key.startsWith("sk-")) {
          await streamFromOpenAI({ messages, model, send });
        } else {
          await mockStream({ prompt, model, send });
        }
      } catch (err) {
        send(`\n\n_⚠️ Error generating response._`);
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

/* ------------------------------------------------------------------ */
/* Real provider (optional, used when OPENAI_API_KEY is configured)    */
/* ------------------------------------------------------------------ */
async function streamFromOpenAI({
  messages,
  model,
  send,
}: {
  messages: IncomingMessage[];
  model: string;
  send: (d: string) => void;
}) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: model.startsWith("gpt") ? model : "gpt-4o-mini",
      stream: true,
      messages,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`OpenAI error: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) send(delta);
      } catch {
        /* ignore */
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* Mock generator – realistic token-by-token streaming for demos       */
/* ------------------------------------------------------------------ */
async function mockStream({
  prompt,
  model,
  send,
}: {
  prompt: string;
  model: string;
  send: (d: string) => void;
}) {
  const reply = buildMockReply(prompt, model);
  // tokenise keeping whitespace so it reads naturally
  const tokens = reply.match(/\S+\s*|\s+/g) ?? [reply];
  for (const token of tokens) {
    send(token);
    // jitter to simulate network/model latency
    await delay(15 + Math.random() * 45);
  }
}

function buildMockReply(prompt: string, model: string): string {
  const p = prompt.trim();
  if (!p) {
    return "Hi! Ask me anything and I'll stream a response back to you.";
  }

  if (/```|code|function|component|react|javascript|python/i.test(p)) {
    return [
      `Sure — here's a quick example you can adapt (model: \`${model}\`).`,
      "",
      "```tsx",
      "function useDebounce<T>(value: T, delay = 300): T {",
      "  const [debounced, setDebounced] = useState(value);",
      "  useEffect(() => {",
      "    const id = setTimeout(() => setDebounced(value), delay);",
      "    return () => clearTimeout(id);",
      "  }, [value, delay]);",
      "  return debounced;",
      "}",
      "```",
      "",
      "**Key points:**",
      "",
      "1. It returns the *latest* value only after `delay` ms of silence.",
      "2. The cleanup clears the pending timer to avoid race conditions.",
      "3. Works great for search inputs and live filters.",
      "",
      "> Tip: pair it with an `AbortController` if you fire network requests.",
    ].join("\n");
  }

  return [
    `Great question! Here's a concise take (responding with **${model}**):`,
    "",
    `You asked: _"${p}"_`,
    "",
    "Here are a few thoughts:",
    "",
    "- This is a **streaming** response rendered token-by-token.",
    "- Markdown is fully supported — *italics*, **bold**, lists, and `inline code`.",
    "- You can **stop** generation anytime, then **regenerate** for a fresh answer.",
    "",
    "Let me know if you'd like me to go deeper on any part! 🚀",
  ].join("\n");
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
