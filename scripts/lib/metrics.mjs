import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

export const MetricsState = {
  sessionId: new Date().toISOString().replace(/[:.]/g, "-"),
  totalTokensUsed: 0,
  apiCalls: 0,
  errors: 0,
  stages: [],
  activeStages: new Map()
};

export function startStage(name, tags = {}) {
  const id = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  MetricsState.activeStages.set(id, { name, tags, start: Date.now() });
  return id;
}

export function endStage(id, data = {}) {
  const stage = MetricsState.activeStages.get(id);
  if (!stage) return;
  const elapsedMs = Date.now() - stage.start;
  MetricsState.stages.push({ ...stage, ...data, elapsedMs, end: Date.now() });
  MetricsState.activeStages.delete(id);
}

export function recordApiCall(tokens, error = false) {
  MetricsState.apiCalls++;
  MetricsState.totalTokensUsed += tokens;
  if (error) MetricsState.errors++;
}

export async function flushMetrics() {
  const logsDir = path.join(process.cwd(), "scripts/logs");
  await fs.mkdir(logsDir, { recursive: true });
  const logFile = path.join(logsDir, `run-${MetricsState.sessionId}.json`);
  
  const data = {
    sessionId: MetricsState.sessionId,
    timestamp: new Date().toISOString(),
    totalTokensUsed: MetricsState.totalTokensUsed,
    apiCalls: MetricsState.apiCalls,
    errors: MetricsState.errors,
    stages: MetricsState.stages,
  };
  
  await fs.writeFile(logFile, JSON.stringify(data, null, 2));
  console.log(`[metrics] Saved run telemetry to ${logFile}`);
}
