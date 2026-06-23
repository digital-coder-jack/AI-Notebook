import { Message } from "@/lib/types";

interface StreamArgs {
  messages: { role: string; content: string }[];
  model: string;
  signal: AbortSignal;
  onChunk: (text: string) => void;
}

/**
 * Calls /api/chat and consumes the response body as a stream.
 * The server sends Server-Sent-Events style lines: `data: {json}\n\n`
 * with a terminating `data: [DONE]`.
 *
 * Cancellation is handled entirely via the AbortSignal passed in:
 * aborting the fetch rejects the read loop, which we swallow as a clean stop.
 */
export async function streamChat({
  messages,
  model,
  signal,
  onChunk,
}: StreamArgs): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line.
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const line = frame.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const parsed = JSON.parse(payload);
        if (parsed.delta) onChunk(parsed.delta as string);
      } catch {
        // ignore malformed frame
      }
    }
  }
}

export function toApiMessages(messages: Message[]) {
  return messages
    .filter((m) => m.content.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content }));
}
