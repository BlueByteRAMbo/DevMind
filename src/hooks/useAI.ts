// ============================================================
// DevMind — useAI Hook
// Wraps /api/ai-proxy. Reads preferred provider from localStorage.
// Never touches API keys — those live only in Vercel env.
// ============================================================

import { useState, useCallback } from "react";
import { callAIProxy } from "../lib/gemini";
import type { AIMessage } from "../types";

function getPreferredProvider(): "gemini" | "claude" {
  try {
    const settings = localStorage.getItem("devmind_settings");
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.preferredAI === "claude" ? "claude" : "gemini";
    }
  } catch {
    // ignore
  }
  return "gemini";
}

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Ask the AI a question. Returns the response text.
   * @param prompt   The user's message
   * @param system   Optional system prompt
   * @param imageUrl Optional image for OCR / vision tasks
   */
  const ask = useCallback(
    async (
      prompt: string,
      system?: string,
      imageUrl?: string
    ): Promise<string> => {
      setLoading(true);
      setError(null);

      const messages: AIMessage[] = [{ role: "user", content: prompt }];

      try {
        const result = await callAIProxy({
          provider: getPreferredProvider(),
          messages,
          systemPrompt: system,
          imageUrl,
        });

        if (result.error) {
          setError(result.error);
          return "";
        }

        return result.text;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown AI error";
        setError(msg);
        return "";
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Extract text from a handwritten image using Gemini Vision.
   */
  const ocr = useCallback(
    async (imageUrl: string): Promise<string> => {
      return ask(
        "Extract all handwritten text from this image. Preserve structure including bullet points, numbered lists, and headings. Output plain text only.",
        "You are an expert OCR assistant. Your task is to accurately transcribe handwritten notes.",
        imageUrl
      );
    },
    [ask]
  );

  /**
   * Generate a synthesis paragraph from all block content in a topic.
   */
  const synthesize = useCallback(
    async (allBlockContent: string, topicName: string): Promise<string> => {
      return ask(
        `Topic: ${topicName}\n\nAll notes and sources:\n\n${allBlockContent}\n\nWrite a concise, insightful synthesis of the above. Explain the topic in your own words as if writing personal study notes. Use paragraphs, not bullet points.`,
        "You are a brilliant learning assistant who synthesises knowledge across multiple sources into clear, insightful summaries."
      );
    },
    [ask]
  );

  /**
   * Generate 5 quiz questions from the topic's blocks.
   */
  const quiz = useCallback(
    async (allBlockContent: string, topicName: string): Promise<string> => {
      return ask(
        `Topic: ${topicName}\n\nStudy material:\n\n${allBlockContent}\n\nGenerate exactly 5 thoughtful questions to test understanding of this topic. For each question, provide the answer on a new line prefixed with "Answer: ". Format each as:\nQ1. [question]\nAnswer: [answer]\n\nQ2. ...`,
        "You are an expert educator creating quiz questions to test deep understanding."
      );
    },
    [ask]
  );

  return { ask, ocr, synthesize, quiz, loading, error };
}
