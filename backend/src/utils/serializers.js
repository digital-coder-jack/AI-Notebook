/**
 * Serializers convert internal records into the public API shapes.
 * They strip sensitive fields (password hashes, provider info, etc.).
 */

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarColor: user.avatarColor,
    defaultModelId: user.defaultModelId,
    createdAt: user.createdAt,
  };
}

export function publicSession(session) {
  if (!session) return null;
  return {
    id: session.id,
    title: session.title,
    modelId: session.modelId,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export function publicMessage(message) {
  if (!message) return null;
  return {
    id: message.id,
    sessionId: message.sessionId,
    role: message.role,
    content: message.content,
    modelId: message.modelId,
    createdAt: message.createdAt,
  };
}
