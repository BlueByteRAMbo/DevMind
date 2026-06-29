// ============================================================
// DevMind — Claude client (same proxy, different provider param)
// ============================================================

import { callAIProxy } from "./gemini";
import type { AIMessage, AIProxyResponse } from "../types";

export async function callClaude(
  messages: AIMessage[],
  systemPrompt?: string
): Promise<AIProxyResponse> {
  return callAIProxy({
    provider: "claude",
    messages,
    systemPrompt,
  });
}
