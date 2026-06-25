import { resolveModel } from '../config/models.js';
import { getProviderConfig } from '../config/providers.js';

/**
 * Sends a chat completion request to the upstream provider.
 *
 * The client only sends a public model id (e.g. "pro-mentor") and the
 * conversation messages. This function resolves the internal provider
 * + upstream model, attaches the secret API key (server-side only) and
 * returns the assistant's reply text.
 *
 * @param {string} modelId   Public model id from the catalog.
 * @param {Array<{role:string, content:string}>} history  Conversation.
 * @returns {Promise<{content: string, modelId: string}>}
 */
export async function generateReply(modelId, history) {
  const resolved = resolveModel(modelId);
  if (!resolved) {
    const err = new Error('Unknown model');
    err.status = 400;
    throw err;
  }

  const provider = getProviderConfig(resolved.tier);
  if (!provider || !provider.apiKey) {
    // No upstream key configured -> graceful local fallback so the app
    // remains fully functional in demo / offline environments.
    return {
      content: localFallbackReply(history),
      modelId,
    };
  }

  const payload = {
    model: resolved.upstreamModel,
    messages: [
      {
        role: 'system',
        content:
          'You are Study Sphere, a friendly and knowledgeable study assistant. ' +
          'Help students learn with clear, concise, accurate explanations.',
      },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.7,
  };

  let response;
  try {
    response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    return { content: localFallbackReply(history), modelId };
  }

  if (!response.ok) {
    // Never leak upstream provider error bodies to the client verbatim.
    const err = new Error('Upstream AI provider error');
    err.status = 502;
    throw err;
  }

  const data = await response.json();
  const content =
    data?.choices?.[0]?.message?.content?.trim() || localFallbackReply(history);

  return { content, modelId };
}

/**
 * Deterministic local reply used when no provider key is configured
 * or the upstream call fails. Keeps the product demoable end-to-end.
 */
function localFallbackReply(history) {
  const lastUser = [...history].reverse().find((m) => m.role === 'user');
  const question = lastUser?.content?.trim() || 'your question';
  return (
    `Here is how I would approach "${question}":\n\n` +
    '1. Break the problem into smaller parts.\n' +
    '2. Identify the key concepts involved.\n' +
    '3. Work through each part step by step.\n\n' +
    'Ask me a follow-up if you would like a deeper explanation.'
  );
}
