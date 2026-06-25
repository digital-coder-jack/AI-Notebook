import type {
  AuthResponse,
  Catalog,
  ChatMessage,
  ChatSession,
  SendMessageResponse,
  User,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

const TOKEN_KEY = 'study_sphere_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (data && typeof data.error === 'string' && data.error) ||
      'Request failed';
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  register(name: string, email: string, password: string) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login(email: string, password: string) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  me() {
    return request<{ user: User }>('/auth/me');
  },

  updateProfile(patch: { name?: string; defaultModelId?: string }) {
    return request<{ user: User }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },

  catalog() {
    return request<Catalog>('/models');
  },

  listSessions() {
    return request<{ sessions: ChatSession[] }>('/chat/sessions');
  },

  createSession(modelId: string) {
    return request<{ session: ChatSession }>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ modelId }),
    });
  },

  getSession(id: string) {
    return request<{ session: ChatSession; messages: ChatMessage[] }>(
      `/chat/sessions/${id}`,
    );
  },

  deleteSession(id: string) {
    return request<void>(`/chat/sessions/${id}`, { method: 'DELETE' });
  },

  sendMessage(sessionId: string, content: string, modelId: string) {
    return request<SendMessageResponse>(
      `/chat/sessions/${sessionId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ content, modelId }),
      },
    );
  },
};
