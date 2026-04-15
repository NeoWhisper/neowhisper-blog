import { API_BASE_URL, API_KEY, MODEL } from "./config";
import {
  DEFAULT_GENERATION_MAX_TOKENS,
  MODEL_FETCH_RETRY_ATTEMPTS,
  MODEL_FETCH_RETRY_DELAY_MS,
} from "./constants";
import { startStage, endStage, recordApiCall, MetricsState } from "./metrics";

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
      response_format: responseFormat,
    }),
  });

  return response.ok
    ? (response.json() as Promise<CompletionResponse>)
    : Promise.reject(new Error(await response.text()));
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
  // Attempt 1: Direct parse
  try {
    return JSON.parse(cleanJsonText(text));
  } catch {
    console.log(
      `[daily-trends] JSON parse failed for ${label}, attempting repair...`,
    );
  }

  // Attempt 2: Handle plain text (wrap as body)
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    const bodyMatch = trimmed.match(/["']body["']\s*:\s*["']([^"']+)["']/i);
    if (bodyMatch) {
      console.log(
        `[daily-trends] Extracted body field from plain text for ${label}`,
      );
      return { body: bodyMatch[1] };
    }
    console.log(`[daily-trends] Wrapping plain text as JSON body for ${label}`);
    return { body: trimmed };
  }

  // Attempt 3: Strip markdown code blocks and retry
  const withoutCodeBlocks = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/, "");
  if (withoutCodeBlocks !== trimmed) {
    try {
      const parsed = JSON.parse(cleanJsonText(withoutCodeBlocks));
      console.log(
        `[daily-trends] JSON repair succeeded (code block removed) for ${label}`,
      );
      return parsed;
    } catch {
      // Continue to next repair attempt
    }
  }

  // Attempt 4-5: AI repair with different prompts
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const repairPrompt =
      attempt === 1
        ? `Fix this JSON to make it valid. Output ONLY the fixed JSON, no explanations:\n\n${text}`
        : `Extract the JSON object from this text. Remove any markdown formatting, comments, or extra text. Output ONLY valid JSON:\n\n${text}`;

    try {
      const repaired = await callAi(
        "JSON Repair Expert. You fix malformed JSON and output ONLY valid JSON.",
        repairPrompt,
        { temperature: 0, maxTokens: 2000 },
      );
      const parsed = JSON.parse(cleanJsonText(repaired));
      console.log(
        `[daily-trends] JSON repair succeeded (attempt ${attempt}) for ${label}`,
      );
      return parsed;
    } catch {
      console.log(
        `[daily-trends] JSON repair attempt ${attempt} failed for ${label}`,
      );
    }
  }

  // Final fallback
  console.warn(
    `[daily-trends] All JSON repair attempts failed for ${label}, returning fallback`,
  );
  return { body: text.trim() };
}
