import { GoogleGenerativeAI } from "@google/generative-ai";

// Cheapest-first: flash-lite models are best for short text (chat, emails, analysis).
export const GEMINI_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-3.1-flash-lite",
] as const;

export function getGeminiApiKeys(): string[] {
  const multi = process.env.GEMINI_API_KEYS;
  if (multi?.trim()) {
    const keys = multi.split(",").map((key) => key.trim()).filter(Boolean);
    if (keys.length > 0) return keys;
  }

  const single = process.env.GEMINI_API_KEY?.trim();
  return single ? [single] : [];
}

export function hasGeminiApiKey(): boolean {
  return getGeminiApiKeys().length > 0;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function isRateLimitError(err: unknown): boolean {
  return /(429|quota|rate limit|resource exhausted|too many requests)/i.test(errorMessage(err));
}

function isInvalidKeyError(err: unknown): boolean {
  return /(401|403|invalid api key|API_KEY_INVALID|permission denied|api key not valid)/i.test(errorMessage(err));
}

function isRetryableModelError(err: unknown): boolean {
  return /(404|503|500|502|504|not found|service unavailable|high demand|temporar|overloaded|try again later)/i.test(errorMessage(err));
}

export type GenerateGeminiTextOptions = {
  timeoutMs?: number;
  maxOutputTokens?: number;
};

async function generateWithModel(
  genAI: GoogleGenerativeAI,
  modelName: string,
  prompt: string,
  options?: Pick<GenerateGeminiTextOptions, "timeoutMs" | "maxOutputTokens">,
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    ...(options?.maxOutputTokens
      ? { generationConfig: { maxOutputTokens: options.maxOutputTokens } }
      : {}),
  });
  const generate = model.generateContent(prompt).then((result) => result.response.text());
  const timeoutMs = options?.timeoutMs;

  if (!timeoutMs) return generate;

  return Promise.race([
    generate,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini generation timed out")), timeoutMs),
    ),
  ]);
}

export async function generateGeminiText(prompt: string, options?: GenerateGeminiTextOptions): Promise<string> {
  const apiKeys = getGeminiApiKeys();
  if (apiKeys.length === 0) {
    throw new Error("Gemini API key not configured");
  }

  let lastErr: unknown;

  for (const apiKey of apiKeys) {
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of GEMINI_MODELS) {
      try {
        return await generateWithModel(genAI, modelName, prompt, options);
      } catch (err: unknown) {
        lastErr = err;

        if (isInvalidKeyError(err) || isRateLimitError(err)) {
          break;
        }

        if (isRetryableModelError(err)) {
          continue;
        }

        continue;
      }
    }
  }

  throw lastErr ?? new Error("Gemini request failed");
}
