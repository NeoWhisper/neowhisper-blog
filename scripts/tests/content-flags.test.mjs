import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

const scriptPath = path.join(
  process.cwd(),
  "scripts/generate-daily-ai-trend-posts.ts",
);

test("--validate-config with valid --lang exits successfully", () => {
  const result = spawnSync(
    "node",
    ["--import", "tsx", scriptPath, "--dry-run", "--validate-config", "--lang=en"],
    { encoding: "utf8" },
  );

  assert.equal(result.status, 0);
  assert.match(result.stdout, /config validation OK/);
  assert.match(result.stdout, /languages: en/);
});

test("invalid --lang exits non-zero with clear message", () => {
  const result = spawnSync(
    "node",
    ["--import", "tsx", scriptPath, "--dry-run", "--validate-config", "--lang=xx"],
    { encoding: "utf8" },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unsupported --lang value "xx"/);
});
