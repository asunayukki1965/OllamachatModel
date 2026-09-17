export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

export interface ServerSettings {
  /** Path hit on this Next.js app; the server-side route forwards to LLAMAFILE_URL */
  endpointLabel: string;
  model: string;
  temperature: number;
}
