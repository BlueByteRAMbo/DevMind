import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import type { Plugin } from "vite";

// ── Local dev AI proxy middleware ─────────────────────────────
// Mirrors /api/ai-proxy so AI features work without `vercel dev`.
// Reads GEMINI_API_KEY and CLAUDE_API_KEY from .env.local.
function localAIProxy(): Plugin {
  return {
    name: "local-ai-proxy",
    configureServer(server) {
      server.middlewares.use("/api/ai-proxy", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405).end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        const chunks: Buffer[] = [];
        req.on("data", (c: Buffer) => chunks.push(c));
        req.on("end", async () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString());
            const { provider, messages, systemPrompt } = body;

            if (provider === "gemini") {
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "GEMINI_API_KEY not set in .env.local" }));
                return;
              }
              const contents = messages.map((m: { role: string; content: string }) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
              }));
              const reqBody: Record<string, unknown> = {
                contents,
                generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
              };
              if (systemPrompt) reqBody.systemInstruction = { parts: [{ text: systemPrompt }] };
              const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
              const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reqBody) });
              const data = await r.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ text }));

            } else if (provider === "claude") {
              const apiKey = process.env.CLAUDE_API_KEY;
              if (!apiKey) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "CLAUDE_API_KEY not set in .env.local" }));
                return;
              }
              const claudeMessages = messages
                .filter((m: { role: string }) => m.role !== "system")
                .map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }));
              const reqBody: Record<string, unknown> = {
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 8192,
                messages: claudeMessages,
              };
              if (systemPrompt) reqBody.system = systemPrompt;
              const r = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
                body: JSON.stringify(reqBody),
              });
              const data = await r.json() as { content?: { text?: string }[] };
              const text = data?.content?.[0]?.text ?? "";
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ text }));
            } else {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: `Unknown provider: ${provider}` }));
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Internal server error";
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: msg }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    localAIProxy(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
      manifest: {
        name: "DevMind",
        short_name: "DevMind",
        description: "Your personal knowledge synthesis workspace",
        theme_color: "#0D0D0F",
        background_color: "#0D0D0F",
        display: "standalone",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

