import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  prompt: z.string().min(1).max(8000),
  target: z.enum(["native", "web"]).default("native"),
  history: z
    .array(z.object({ role: z.enum(["user", "model"]), text: z.string().max(20000) }))
    .max(20)
    .optional(),
  userApiKey: z.string().trim().max(200).optional(),
  model: z.string().max(100).optional(),
});

const SYSTEM_NATIVE = `You are an expert React Native + Expo engineer. Generate a single self-contained App.tsx file that runs on Expo Snack (SDK 51+).
Rules:
- Use ONLY: react, react-native, expo, expo-status-bar, and react-native built-in components.
- Default export a component named App.
- Use StyleSheet.create. Modern, youthful, vibrant design.
- No external image URLs unless from picsum.photos or unsplash source.
- No file system, no native modules requiring config.
- Output ONLY one fenced code block: \`\`\`tsx ... \`\`\` containing the full App.tsx. No prose.`;

const SYSTEM_WEB = `You are an expert React + Tailwind engineer. Generate a single self-contained App.tsx (React 18) component.
Rules:
- Default export a component named App.
- Use Tailwind utility classes. Modern, vibrant, youthful design.
- No external imports beyond react. No router. No fetches.
- Output ONLY one fenced code block: \`\`\`tsx ... \`\`\` containing the full component. No prose.`;

export const generateCode = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = data.userApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "No Gemini API key available. Add your own in settings." };
    }

    const model = data.model || "gemini-2.0-flash-exp";
    const system = data.target === "web" ? SYSTEM_WEB : SYSTEM_NATIVE;

    const contents = [
      ...(data.history ?? []).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
      { role: "user", parts: [{ text: data.prompt }] },
    ];

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
          }),
        },
      );

      if (!res.ok) {
        const txt = await res.text();
        console.error("Gemini error", res.status, txt);
        return { ok: false as const, error: `Gemini API error (${res.status}). ${txt.slice(0, 200)}` };
      }

      const json = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";

      const match = text.match(/```(?:tsx|jsx|ts|js|typescript|javascript)?\n([\s\S]*?)```/);
      const code = (match?.[1] ?? text).trim();

      return { ok: true as const, code, raw: text };
    } catch (e) {
      console.error("generate failed", e);
      return { ok: false as const, error: e instanceof Error ? e.message : "Unknown error" };
    }
  });
