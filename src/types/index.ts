// ============================================================
// DevMind — Centralised TypeScript Types
// Every component imports from here. Never define inline types.
// ============================================================

export type BlockType =
  | "ai_response"
  | "url_clip"
  | "youtube_note"
  | "handwritten_scan"
  | "own_note"
  | "synthesis";

export interface Topic {
  id: string;
  name: string;
  colour: string;
  collectionId?: string;
  createdAt: Date;
  updatedAt: Date;
  /** Percentage of mastery (0‑100) for the topic */
  masteryPercent?: number;
}

export type AIProvider = "gemini" | "claude" | "openai" | "groq" | "ollama";

export interface Block {
  id?: string;           // optional — Dexie auto-generates numeric id, UUID for cloud
  topicId: string;
  type: BlockType;
  content: string;
  sourceUrl?: string;
  sourceTitle?: string;
  imageUrl?: string;     // Supabase Storage URL for handwritten scan photo
  ocrText?: string | null;  // Gemini Vision extracted text
  order: number;
  isPinned: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  syncStatus: "synced" | "pending" | "conflict";
}

export interface Collection {
  id?: string;
  name: string;
  topicIds: string[];
  createdAt: Date;
}

export interface UserSettings {
  claudeApiKey?: string;  // memory-only, never synced
  geminiApiKey: string;
  preferredAI: "gemini" | "claude";
  theme: "dark";
}

// Supabase Auth user (slim shape stored in Zustand)
export interface AppUser {
  id: string;
  email: string;
}

// AI message shape for /api/ai-proxy
export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIProxyRequest {
  provider: "gemini" | "claude" | "openai" | "groq" | "ollama";
  messages: AIMessage[];
  systemPrompt?: string;
  imageUrl?: string;
}

export interface AIProxyResponse {
  text: string;
  error?: string;
}
