// ============================================================
// DevMind — Gemini AI client helper
// Called only from src/hooks/useAI.ts, never directly from components.
// API key is NEVER exposed client-side — all calls go through /api/ai-proxy.
// ============================================================

import type { AIProxyRequest, AIProxyResponse } from "../types";

/**
 * Call the Vercel serverless AI proxy.
 * Falls back to a helpful error message if the proxy is unavailable.
 */
export async function callAIProxy(
  req: AIProxyRequest
): Promise<AIProxyResponse> {
  try {
    const response = await fetch("/api/ai-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        text: "",
        error: `AI proxy returned ${response.status}: ${text}`,
      };
    }

    const data = await response.json();
    return { text: data.text || "" };
  } catch (err) {
    return {
      text: "",
      error:
        "Could not reach the AI proxy. Make sure you have deployed to Vercel or are running the dev server with the /api route configured.",
    };
  }
}
