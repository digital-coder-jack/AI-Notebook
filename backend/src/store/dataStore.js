/**
 * In-memory data store for users, chat sessions and messages.
 *
 * This keeps the backend self-contained and runnable without an
 * external database. For production you can swap these functions for
 * a real database (Postgres, Mongo, etc.) while keeping the same API.
 */

import { v4 as uuidv4 } from 'uuid';

const users = new Map(); // userId -> user
const usersByEmail = new Map(); // email -> userId
const sessions = new Map(); // sessionId -> session
const messages = new Map(); // sessionId -> [messages]

// ---------- Users ----------

export function createUser({ name, email, passwordHash }) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const user = {
    id,
    name,
    email: email.toLowerCase(),
    passwordHash,
    avatarColor: pickColor(name),
    defaultModelId: 'lite-swift',
    createdAt: now,
    updatedAt: now,
  };
  users.set(id, user);
  usersByEmail.set(user.email, id);
  return user;
}

export function findUserByEmail(email) {
  const id = usersByEmail.get(String(email).toLowerCase());
  return id ? users.get(id) : null;
}

export function findUserById(id) {
  return users.get(id) || null;
}

export function updateUser(id, patch) {
  const user = users.get(id);
  if (!user) return null;
  const updated = { ...user, ...patch, updatedAt: new Date().toISOString() };
  users.set(id, updated);
  return updated;
}

// ---------- Sessions ----------

export function createSession({ userId, title, modelId }) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const session = {
    id,
    userId,
    title: title || 'New Chat',
    modelId,
    createdAt: now,
    updatedAt: now,
  };
  sessions.set(id, session);
  messages.set(id, []);
  return session;
}

export function listSessions(userId) {
  return [...sessions.values()]
    .filter((s) => s.userId === userId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function getSession(id) {
  return sessions.get(id) || null;
}

export function updateSession(id, patch) {
  const session = sessions.get(id);
  if (!session) return null;
  const updated = { ...session, ...patch, updatedAt: new Date().toISOString() };
  sessions.set(id, updated);
  return updated;
}

export function deleteSession(id) {
  sessions.delete(id);
  messages.delete(id);
}

// ---------- Messages ----------

export function addMessage(sessionId, { role, content, modelId }) {
  const list = messages.get(sessionId);
  if (!list) return null;
  const message = {
    id: uuidv4(),
    sessionId,
    role,
    content,
    modelId: modelId || null,
    createdAt: new Date().toISOString(),
  };
  list.push(message);
  return message;
}

export function listMessages(sessionId) {
  return messages.get(sessionId) || [];
}

// ---------- Helpers ----------

const COLORS = ['#5865F2', '#57F287', '#FEE75C', '#EB459E', '#ED4245', '#3BA55D', '#FAA61A'];

function pickColor(seed) {
  const str = String(seed || 'user');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}
