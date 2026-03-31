import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

async function inspectMetrics() {
  const logsDir = path.join(process.cwd(), "scripts/logs");
  
  let files;
  try {
    files = await fs.readdir(logsDir);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("No scripts/logs directory found.");
      return;
    }
    throw err;
  }

  const jsonFiles = files.filter(f => f.endsWith(".json"));
  if (jsonFiles.length === 0) {
    console.log("No JSON metrics files found in scripts/logs.");
    return;
  }

  const runs = [];
  for (const file of jsonFiles) {
    const raw = await fs.readFile(path.join(logsDir, file), "utf8");
    runs.push(JSON.parse(raw));
  }

  runs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  let totalTokens = 0;
  let totalApiErrors = 0;
  let stageStats = {};

  runs.forEach(run => {
    totalTokens += run.totalTokensUsed || 0;
    totalApiErrors += run.errors || 0;
    
    (run.stages || []).forEach(stage => {
      if (!stageStats[stage.name]) {
        stageStats[stage.name] = { count: 0, totalMs: 0, maxMs: 0 };
      }
      stageStats[stage.name].count++;
      stageStats[stage.name].totalMs += stage.elapsedMs;
      if (stage.elapsedMs > stageStats[stage.name].maxMs) {
        stageStats[stage.name].maxMs = stage.elapsedMs;
      }
    });
  });

  const avgTokens = Math.round(totalTokens / runs.length);
  const latestRun = runs[runs.length - 1];

  console.log("=========================================");
  console.log(`METRICS INSPECTION (${runs.length} runs aggregate)`);
  console.log("=========================================");
  console.log(`Total Tokens Used (All-time): ${totalTokens}`);
  console.log(`Average Tokens per run:       ${avgTokens}`);
  console.log(`Total API Failures/Retries:   ${totalApiErrors}`);
  console.log("-----------------------------------------");
  console.log("LATEST RUN SUMMARY:");
  console.log(`  Session ID:   ${latestRun.sessionId}`);
  console.log(`  Model Used:   ${latestRun.config?.model || "unknown"}`);
  console.log(`  Tokens Used:  ${latestRun.totalTokensUsed}`);
  console.log("-----------------------------------------");
  console.log("PER-STAGE AVERAGE DURATIONS:");

  Object.entries(stageStats).forEach(([name, stats]) => {
    const avgMs = Math.round(stats.totalMs / stats.count);
    const avgSec = (avgMs / 1000).toFixed(1);
    const maxSec = (stats.maxMs / 1000).toFixed(1);
    console.log(`  ${name.padEnd(16)}: ~${avgSec.padStart(5)} s (max: ${maxSec} s)`);
  });
  console.log("=========================================");
}

inspectMetrics().catch(console.error);
