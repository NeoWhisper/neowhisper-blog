import { API_BASE_URL, API_KEY, MODEL } from "./config";
import { DEFAULT_GENERATION_MAX_TOKENS, MODEL_FETCH_RETRY_ATTEMPTS, MODEL_FETCH_RETRY_DELAY_MS } from "./constants";
import { startStage, endStage, recordApiCall, MetricsState } from "./metrics";

export const AiState = {
  get totalTokensUsed() { return MetricsState.totalTokensUsed; }
};

const extractJsonFromCodeblock = (text) =>
  text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1] ?? text;

const cleanJsonText = (text) => {
  const extracted = extractJsonFromCodeblock(text).trim();
  // Remove control characters and invalid escape sequences
  return extracted
    .replace(/[\x00-\x1F\x7F]/g, ' ') // Replace control characters with space
    .replace(/\\[\x00-\x1F]/g, '') // Remove invalid escape sequences
    .replace(/[\r\n]+/g, ' ') // Replace newlines with space in strings
    .trim();
};

const sendApiRequest = async (systemPrompt, userPrompt, opts) => {
  const { maxTokens, temperature, responseFormat } = opts;
  const response = await fetch(`${API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: responseFormat
    }),
  });

  return response.ok
    ? response.json()
    : Promise.reject(new Error(await response.text()));
};

const retryWithExponentialBackoff = async (fn, maxAttempts, delayMs) => {
  let lastError;

  for (const attempt of Array.from({ length: maxAttempts }, (_, i) => i + 1)) {
    try {
      return await fn(attempt);
    } catch (e) {
      lastError = e;
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError;
};

export async function callAi(sys, user, opts = {}) {
  const { maxTokens = DEFAULT_GENERATION_MAX_TOKENS, temperature = 0.5, responseFormat } = opts;
  const stageId = startStage("callAi", { model: MODEL });

  try {
    const result = await retryWithExponentialBackoff(
      async (attempt) => {
        const payload = await sendApiRequest(sys, user, { maxTokens, temperature, responseFormat });
        const tokens = (payload.usage?.prompt_tokens ?? 0) + (payload.usage?.completion_tokens ?? 0);
        recordApiCall(tokens, false);
        endStage(stageId, { attempt, success: true, tokens });
        return payload?.choices?.[0]?.message?.content?.trim() ?? "";
      },
      MODEL_FETCH_RETRY_ATTEMPTS,
      MODEL_FETCH_RETRY_DELAY_MS
    );
    return result;
  } catch (error) {
    recordApiCall(0, true);
    endStage(stageId, { success: false, error: error?.message ?? "Unknown error" });
    throw error;
  }
}

export async function parseJsonWithRepair({ text, label }) {
  const attempt = async () => {
    const clean = cleanJsonText(text);
    return JSON.parse(clean);
  };

  try {
    return await attempt();
  } catch {
    console.log(`[daily-trends] Repairing JSON for ${label}...`);
    const repaired = await callAi(
      "JSON Repairer.",
      `Return only valid JSON based on this: ${text}`,
      { temperature: 0 }
    );
    return JSON.parse(cleanJsonText(repaired));
  }
}
