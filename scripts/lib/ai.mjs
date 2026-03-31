import { API_BASE_URL, API_KEY, MODEL } from "./config.mjs";
import { DEFAULT_GENERATION_MAX_TOKENS, MODEL_FETCH_RETRY_ATTEMPTS, MODEL_FETCH_RETRY_DELAY_MS } from "./constants.mjs";
import { startStage, endStage, recordApiCall, MetricsState } from "./metrics.mjs";

export const AiState = {
  get totalTokensUsed() { return MetricsState.totalTokensUsed; }
};

export async function callAi(sys, user, opts = {}) {
  const { maxTokens = DEFAULT_GENERATION_MAX_TOKENS, temperature = 0.5, responseFormat } = opts;
  let lastErr;
  const stageId = startStage("callAi", { model: MODEL });

  for (let a = 1; a <= MODEL_FETCH_RETRY_ATTEMPTS; a++) {
    try {
      const r = await fetch(`${API_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, temperature, max_tokens: maxTokens, messages: [{ role: "system", content: sys }, { role: "user", content: user }], response_format: responseFormat }),
      });
      if (!r.ok) throw new Error(await r.text());
      const p = await r.json();
      const tokens = (p.usage?.prompt_tokens || 0) + (p.usage?.completion_tokens || 0);
      recordApiCall(tokens, false);
      endStage(stageId, { attempt: a, success: true, tokens });
      return p?.choices?.[0]?.message?.content?.trim() || "";
    } catch (e) {
      lastErr = e;
      recordApiCall(0, true);
      await new Promise(res => setTimeout(res, MODEL_FETCH_RETRY_DELAY_MS * a));
    }
  }
  endStage(stageId, { success: false, error: lastErr?.message || "Unknown error" });
  throw lastErr;
}

export async function parseJsonWithRepair({ text, label }) {
  const clean = (s) => (s.includes("```") ? (s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1] || s) : s).trim();
  try { return JSON.parse(clean(text)); } catch {
    console.log(`[daily-trends] Repairing JSON for ${label}...`);
    const rep = await callAi("JSON Repairer.", `Return only valid JSON based on this: ${text}`, { temperature: 0 });
    return JSON.parse(clean(rep));
  }
}
