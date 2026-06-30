// ============================================================
// DevMind — AI Proxy Serverless Function
// Vercel serverless: /api/ai-proxy
// Reads API keys from Vercel environment variables ONLY.
// Client never sees any keys.
// ============================================================

import type { VercelRequest, VercelResponse } from "@vercel/node";

import type { AIMessage, AIProxyRequest } from "../src/types";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { provider, messages, systemPrompt, imageUrl }: AIProxyRequest = req.body;

  try {
    if (provider === "gemini") {
      return await handleGemini(req, res, messages, systemPrompt, imageUrl);
    } else if (provider === "claude") {
      return await handleClaude(req, res, messages, systemPrompt);
    } else if (provider === "openai") {
      return await handleOpenAI(req, res, messages, systemPrompt);
    } else if (provider === "groq") {
      return await handleGroq(req, res, messages, systemPrompt);
    } else if (provider === "ollama") {
      return await handleOllama(req, res, messages, systemPrompt);
    } else {
      return res.status(400).json({ error: `Unknown provider: ${provider}` });
    }
  } catch (err: any) {
    console.error("[ai-proxy] Error:", err);
    return res.status(500).json({ error: err?.message ?? "Internal server error" });
  }
}

// ── Gemini 2.0 Flash ─────────────────────────────────────────
async function handleGemini(
  _req: VercelRequest,
  res: VercelResponse,
  messages: AIMessage[],
  systemPrompt?: string,
  imageUrl?: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
  }

  // Build Gemini request body
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // If an image URL is provided, add it to the last user message for vision
  if (imageUrl && contents.length > 0) {
    const lastContent = contents[contents.length - 1];
    lastContent.parts.push({
      // @ts-ignore — Gemini API part shape
      inlineData: undefined,
      fileData: { mimeType: "image/jpeg", fileUri: imageUrl },
    } as any);
  }

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  };

  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    return res.status(response.status).json({ error: `Gemini error: ${text}` });
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return res.status(200).json({ text });
}

// ── Claude (Anthropic) ────────────────────────────────────────
async function handleClaude(
  _req: VercelRequest,
  res: VercelResponse,
  messages: AIMessage[],
  systemPrompt?: string
) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "CLAUDE_API_KEY is not configured. Add it in Vercel environment variables." });
  }

  const claudeMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const body: Record<string, unknown> = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8192,
    messages: claudeMessages,
  };

  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    return res.status(response.status).json({ error: `Claude error: ${text}` });
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text ?? "";

  return res.status(200).json({ text });
}

// ── OpenAI ───────────────────────────────────────────────────
async function handleOpenAI(_req: VercelRequest, res: VercelResponse, messages: AIMessage[], systemPrompt?: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY is not configured." });

  const openaiMessages = messages.map(m => ({ role: m.role, content: m.content }));
  if (systemPrompt) openaiMessages.unshift({ role: "system", content: systemPrompt });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: openaiMessages })
  });

  if (!response.ok) return res.status(response.status).json({ error: `OpenAI error: ${await response.text()}` });
  const data = await response.json();
  return res.status(200).json({ text: data.choices?.[0]?.message?.content ?? "" });
}

// ── Groq ─────────────────────────────────────────────────────
async function handleGroq(_req: VercelRequest, res: VercelResponse, messages: AIMessage[], systemPrompt?: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY is not configured." });

  const groqMessages = messages.map(m => ({ role: m.role, content: m.content }));
  if (systemPrompt) groqMessages.unshift({ role: "system", content: systemPrompt });

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: groqMessages })
  });

  if (!response.ok) return res.status(response.status).json({ error: `Groq error: ${await response.text()}` });
  const data = await response.json();
  return res.status(200).json({ text: data.choices?.[0]?.message?.content ?? "" });
}

// ── Ollama (Local) ───────────────────────────────────────────
async function handleOllama(_req: VercelRequest, res: VercelResponse, messages: AIMessage[], systemPrompt?: string) {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  
  const ollamaMessages = messages.map(m => ({ role: m.role, content: m.content }));
  if (systemPrompt) ollamaMessages.unshift({ role: "system", content: systemPrompt });

  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama3", messages: ollamaMessages, stream: false })
  });

  if (!response.ok) return res.status(response.status).json({ error: `Ollama error: ${await response.text()}` });
  const data = await response.json();
  return res.status(200).json({ text: data.message?.content ?? "" });
}

