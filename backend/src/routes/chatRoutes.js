import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createSession,
  listSessions,
  getSession,
  updateSession,
  deleteSession,
  addMessage,
  listMessages,
} from '../store/dataStore.js';
import { publicSession, publicMessage } from '../utils/serializers.js';
import { generateReply } from '../services/aiService.js';
import { resolveModel } from '../config/models.js';

const router = Router();

// All chat routes require authentication.
router.use(authMiddleware);

/** List all sessions for the current user. */
router.get('/sessions', (req, res) => {
  const sessions = listSessions(req.user.id).map(publicSession);
  res.json({ sessions });
});

/** Create a new chat session. */
router.post('/sessions', (req, res) => {
  const { title, modelId } = req.body || {};
  const resolvedModelId = modelId || req.user.defaultModelId || 'lite-swift';

  if (!resolveModel(resolvedModelId)) {
    return res.status(400).json({ error: 'Unknown model' });
  }

  const session = createSession({
    userId: req.user.id,
    title: title || 'New Chat',
    modelId: resolvedModelId,
  });
  return res.status(201).json({ session: publicSession(session) });
});

/** Get a single session with its messages. */
router.get('/sessions/:id', (req, res) => {
  const session = getSession(req.params.id);
  if (!session || session.userId !== req.user.id) {
    return res.status(404).json({ error: 'Session not found' });
  }
  return res.json({
    session: publicSession(session),
    messages: listMessages(session.id).map(publicMessage),
  });
});

/** Delete a session. */
router.delete('/sessions/:id', (req, res) => {
  const session = getSession(req.params.id);
  if (!session || session.userId !== req.user.id) {
    return res.status(404).json({ error: 'Session not found' });
  }
  deleteSession(session.id);
  return res.status(204).send();
});

/**
 * Send a message in a session and receive the AI reply.
 * Body: { content: string, modelId?: string }
 */
router.post('/sessions/:id/messages', async (req, res, next) => {
  try {
    const session = getSession(req.params.id);
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { content, modelId } = req.body || {};
    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'content is required' });
    }

    const activeModelId = modelId || session.modelId;
    if (!resolveModel(activeModelId)) {
      return res.status(400).json({ error: 'Unknown model' });
    }

    // Persist the user message.
    const userMessage = addMessage(session.id, {
      role: 'user',
      content: String(content).trim(),
      modelId: activeModelId,
    });

    // Auto-title the session from the first user message.
    if (session.title === 'New Chat') {
      const trimmed = String(content).trim();
      updateSession(session.id, {
        title: trimmed.length > 40 ? `${trimmed.slice(0, 40)}...` : trimmed,
        modelId: activeModelId,
      });
    } else {
      updateSession(session.id, { modelId: activeModelId });
    }

    // Build history and call the provider via the backend.
    const history = listMessages(session.id).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const reply = await generateReply(activeModelId, history);

    const assistantMessage = addMessage(session.id, {
      role: 'assistant',
      content: reply.content,
      modelId: activeModelId,
    });

    return res.status(201).json({
      userMessage: publicMessage(userMessage),
      assistantMessage: publicMessage(assistantMessage),
      session: publicSession(getSession(session.id)),
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
