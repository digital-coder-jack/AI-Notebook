export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  /** true while the assistant message is being streamed */
  streaming?: boolean;
  /** true if the generation was cancelled/errored */
  error?: boolean;
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface ModelOption {
  id: string;
  label: string;
  description: string;
}

export const MODELS: ModelOption[] = [
  { id: "gpt-4o", label: "GPT-4o", description: "Most capable, multimodal" },
  { id: "gpt-4o-mini", label: "GPT-4o mini", description: "Fast & affordable" },
  { id: "claude-3.5", label: "Claude 3.5 Sonnet", description: "Great at reasoning" },
  { id: "llama-3.1", label: "Llama 3.1 70B", description: "Open source model" },
];

export const DEFAULT_MODEL = MODELS[0].id;
