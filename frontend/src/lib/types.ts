// Shared API contract types. These mirror the backend serializers and
// the Android data models so all three apps speak the same language.

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  defaultModelId: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Model {
  id: string;
  name: string;
  description: string;
}

export interface Plan {
  name: string;
  tier: string;
  description: string;
  models: Model[];
}

export interface Catalog {
  plans: Plan[];
}

export interface ChatSession {
  id: string;
  title: string;
  modelId: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  modelId: string | null;
  createdAt: string;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  session: ChatSession;
}
