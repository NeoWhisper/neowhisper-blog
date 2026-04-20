import { Agent, setGlobalDispatcher } from "undici";
import { z } from "zod";
import {
  API_BASE_URL,
  API_KEY,
  MODEL,
  isOfficialOpenAiBaseUrl,
} from "./config";

import {
  DEFAULT_GENERATION_MAX_TOKENS,
  MODEL_FETCH_RETRY_ATTEMPTS,
  MODEL_FETCH_RETRY_DELAY_MS,
  MODEL_FETCH_TIMEOUT_MS,
} from "./constants";

// Zod schemas for runtime type validation (Phase 2)
const CompletionUsageSchema = z.object({
  prompt_tokens: z.number().optional(),
  completion_tokens: z.number().optional(),
});

const CompletionMessageSchema = z.object({
  content: z.string().optional(),
});

const CompletionChoiceSchema = z.object({
  message: CompletionMessageSchema.optional(),
});

export const CompletionResponseSchema = z.object({
  usage: CompletionUsageSchema.optional(),
  choices: z.array(CompletionChoiceSchema).optional(),
});

// Type inference from schemas
export type ValidatedCompletionResponse = z.infer<
  typeof CompletionResponseSchema
>;

// Increase default timeouts for long-running AI generations (e.g., local 35B models)
setGlobalDispatcher(
  new Agent({
    headersTimeout: MODEL_FETCH_TIMEOUT_MS,
    bodyTimeout: MODEL_FETCH_TIMEOUT_MS,
  }),
);

import { startStage, endStage, recordApiCall, MetricsState } from "./metrics";
import { createLogger, classifyError } from "./errors";

const logger = createLogger("ai");

type ApiResponseFormat = { type: "json_object" } | undefined;

type CallAiOptions = {
  maxTokens?: number;
  temperature?: number;
  responseFormat?: ApiResponseFormat;
};

type CompletionResponse = {
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export const AiState = {
  get totalTokensUsed() {
    return MetricsState.totalTokensUsed;
  },
};

const extractJsonFromCodeblock = (text: string) =>
  text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1] ?? text;

const cleanJsonText = (text: string) => {
  const extracted = extractJsonFromCodeblock(text).trim();
  // Remove control characters and invalid escape sequences
  return extracted
    .replace(/[\x00-\x1F\x7F]/g, " ") // Replace control characters with space
    .replace(/\\[\x00-\x1F]/g, "") // Remove invalid escape sequences
    .replace(/[\r\n]+/g, " ") // Replace newlines with space in strings
    .trim();
};

const sendApiRequest = async (
  systemPrompt: string,
  userPrompt: string,
  opts: Required<Pick<CallAiOptions, "maxTokens" | "temperature">> &
    Pick<CallAiOptions, "responseFormat">,
): Promise<CompletionResponse> => {
  const { maxTokens, temperature, responseFormat } = opts;
  const response = await fetch(`${API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      // Only send response_format for OpenAI official API
      // Local APIs (Ollama/LM Studio) handle JSON via system prompts
      ...(responseFormat && isOfficialOpenAiBaseUrl(API_BASE_URL)
        ? { response_format: responseFormat }
        : {}),
    }),
  });

  // Guard: HTTP error (early return pattern)
  if (!response.ok) {
    return Promise.reject(new Error(await response.text()));
  }

  // Parse and validate with Zod (functional validation chain)
  const rawJson = await response.json();
  const parsed = CompletionResponseSchema.safeParse(rawJson);

  // Guard: Schema validation failed (early return with context)
  if (!parsed.success) {
    return Promise.reject(
      new Error(`Invalid API response format: ${parsed.error.message}`),
    );
  }

  return parsed.data;
};

const retryWithExponentialBackoff = async <T>(
  fn: (attempt: number) => Promise<T>,
  maxAttempts: number,
  delayMs: number,
): Promise<T> => {
  let lastError: Error | undefined;

  for (const attempt of Array.from({ length: maxAttempts }, (_, i) => i + 1)) {
    try {
      return await fn(attempt);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError ?? new Error("Unknown retry error");
};

export async function callAi(
  sys: string,
  user: string,
  opts: CallAiOptions = {},
): Promise<string> {
  const {
    maxTokens = DEFAULT_GENERATION_MAX_TOKENS,
    temperature = 0.5,
    responseFormat,
  } = opts;
  const stageId = startStage("callAi", { model: MODEL });

  try {
    const result = await retryWithExponentialBackoff(
      async (attempt) => {
        const payload = await sendApiRequest(sys, user, {
          maxTokens,
          temperature,
          responseFormat,
        });
        const tokens =
          (payload.usage?.prompt_tokens ?? 0) +
          (payload.usage?.completion_tokens ?? 0);
        recordApiCall(tokens, false);
        endStage(stageId, { attempt, success: true, tokens });
        return payload?.choices?.[0]?.message?.content?.trim() ?? "";
      },
      MODEL_FETCH_RETRY_ATTEMPTS,
      MODEL_FETCH_RETRY_DELAY_MS,
    );
    return result;
  } catch (error) {
    recordApiCall(0, true);
    const message = error instanceof Error ? error.message : "Unknown error";
    endStage(stageId, { success: false, error: message });
    throw error;
  }
}

export async function parseJsonWithRepair({
  text,
  label,
  maxRetries = 2,
}: {
  text: string;
  label: string;
  maxRetries?: number;
}) {
  // Attempt 1: Direct parse (guard clause pattern)
  try {
    return JSON.parse(cleanJsonText(text));
  } catch {
    logger.info("JSON parse failed, attempting repair", { operation: label });
  }

  // Attempt 2: Handle plain text (wrap as body)
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    const bodyMatch = trimmed.match(/["']body["']\s*:\s*["']([^"']+)["']/i);
    // Guard: body field found (early return)
    if (bodyMatch) {
      logger.info("Extracted body field from plain text", { operation: label });
      return { body: bodyMatch[1] };
    }
    logger.info("Wrapping plain text as JSON body", { operation: label });
    return { body: trimmed };
  }

  // Attempt 3: Strip markdown code blocks and retry (functional: only if changed)
  const withoutCodeBlocks = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/, "");

  const codeBlockRemoved = withoutCodeBlocks !== trimmed;
  if (codeBlockRemoved) {
    try {
      const parsed = JSON.parse(cleanJsonText(withoutCodeBlocks));
      logger.info("JSON repair succeeded (code block removed)", {
        operation: label,
      });
      return parsed;
    } catch {
      // Continue to AI repair - fall through intentionally
    }
  }

  // Attempt 4-5: AI repair with different prompts
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Data-driven prompt selection (no nested ternary)
    const repairPrompts = [
      `Fix this JSON to make it valid. Output ONLY the fixed JSON, no explanations:\n\n${text}`,
      `Extract the JSON object from this text. Remove any markdown formatting, comments, or extra text. Output ONLY valid JSON:\n\n${text}`,
    ];
    const repairPrompt =
      repairPrompts[Math.min(attempt - 1, repairPrompts.length - 1)];

    try {
      const repaired = await callAi(
        "JSON Repair Expert. You fix malformed JSON and output ONLY valid JSON.",
        repairPrompt,
        { temperature: 0, maxTokens: 2000 },
      );
      const parsed = JSON.parse(cleanJsonText(repaired));
      logger.info("JSON repair succeeded via AI", {
        operation: label,
        attempt,
      });
      return parsed;
    } catch (error) {
      logger.warn("JSON repair attempt failed", {
        operation: label,
        attempt,
        error: classifyError(error, { operation: label, attempt }),
      });
    }
  }

  // Final fallback (structured warning for observability)
  logger.warn("All JSON repair attempts failed, returning fallback", {
    operation: label,
    maxRetries,
    bodyPreview: text.trim().slice(0, 100),
  });
  return { body: text.trim() };
}
