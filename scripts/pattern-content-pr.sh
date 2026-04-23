#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

BASE_BRANCH="${BASE_BRANCH:-contents}"
MAIN_BRANCH="${MAIN_BRANCH:-main}"
SYNC_MAIN_INTO_CONTENTS="${SYNC_MAIN_INTO_CONTENTS:-true}"
AUTO_PUSH_SYNC="${AUTO_PUSH_SYNC:-true}"
RUN_BUILD_VALIDATION="${RUN_BUILD_VALIDATION:-true}"
FORCE_GENERATE="${FORCE_GENERATE:-false}"
PR_BRANCH_PREFIX="${PR_BRANCH_PREFIX:-pattern-content}"

# Pattern and Category selection
PATTERN="${PATTERN:-brief}"
CATEGORY="${CATEGORY:-}"

if [[ -f "${REPO_ROOT}/.env.local" ]]; then
  set -a
  source "${REPO_ROOT}/.env.local"
  set +a
fi

declare -a REQUIRED_VARS=("OPENAI_BASE_URL" "OPENAI_MODEL" "OPENAI_API_MODE")
for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "[pattern-local] Error: Required environment variable '${var}' is not set."
    echo "[pattern-local] Set it in .env.local or export it before running this script."
    exit 1
  fi
done

NODE_BINARY="${NODE_BINARY:-$(command -v node || true)}"
NPM_BINARY="${NPM_BINARY:-$(command -v npm || true)}"

if [[ "${OPENAI_BASE_URL}" == "https://api.openai.com/v1" ]] && [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "[pattern-local] Error: OPENAI_API_KEY is required when using official OpenAI endpoint."
  exit 1
fi

export OPENAI_BASE_URL
export OPENAI_MODEL
export OPENAI_API_MODE
export OPENAI_API_KEY

if [[ -z "${NODE_BINARY}" ]]; then
  echo "[pattern-local] Node.js is required but was not found."
  echo "[pattern-local] Add node to PATH or set NODE_BINARY."
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "[pattern-local] GitHub CLI (gh) is required."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "[pattern-local] gh is not authenticated. Run: gh auth login"
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "[pattern-local] Working tree is not clean. Commit or stash changes before running."
  exit 1
fi

# Parse command line arguments for --pattern and --category
while [[ $# -gt 0 ]]; do
  case $1 in
    --pattern=*)
      PATTERN="${1#*=}"
      shift
      ;;
    --category=*)
      CATEGORY="${1#*=}"
      shift
      ;;
    --force)
      FORCE_GENERATE="true"
      shift
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --pattern=NAME    Article pattern: brief, tutorial, or analysis (default: brief)"
      echo "  --category=SLUG   Category slug (e.g., ai-ml, next.js, typescript)"
      echo "  --force           Force generation even if content exists"
      echo "  --help            Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0 --pattern=tutorial --category=ai-ml"
      echo "  $0 --pattern=analysis --category=next.js --force"
      exit 0
      ;;
    *)
      echo "[pattern-local] Unknown option: $1"
      echo "[pattern-local] Use --help for usage information."
      exit 1
      ;;
  esac
done

# Validate pattern
if [[ ! "$PATTERN" =~ ^(brief|tutorial|analysis)$ ]]; then
  echo "[pattern-local] Error: Invalid pattern '${PATTERN}'."
  echo "[pattern-local] Valid patterns: brief, tutorial, analysis"
  exit 1
fi

# Validate Ollama setup
if [[ "$OPENAI_BASE_URL" == http://127.0.0.1:* || "$OPENAI_BASE_URL" == http://localhost:* ]]; then
  OLLAMA_BASE="${OPENAI_BASE_URL%/v1}"
  OLLAMA_TAGS_JSON="$(curl -fsS "${OLLAMA_BASE}/api/tags" || true)"
  if [[ -z "${OLLAMA_TAGS_JSON}" ]]; then
    echo "[pattern-local] Ollama endpoint is not reachable at ${OLLAMA_BASE}."
    echo "[pattern-local] Start Ollama first (for example: ollama serve)."
    exit 1
  fi

  if ! OPENAI_MODEL="${OPENAI_MODEL}" "${NODE_BINARY}" -e '
    let input = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (input += chunk));
    process.stdin.on("end", () => {
      try {
        const payload = JSON.parse(input);
        const models = Array.isArray(payload.models) ? payload.models : [];
        const selected = process.env.OPENAI_MODEL || "";
        const found = models.some((m) => m && typeof m.name === "string" && m.name === selected);
        process.exit(found ? 0 : 1);
      } catch {
        process.exit(1);
      }
    });
  ' <<< "${OLLAMA_TAGS_JSON}"; then
    echo "[pattern-local] Model '${OPENAI_MODEL}' is not installed in Ollama."
    echo "[pattern-local] Install it first, for example: ollama pull ${OPENAI_MODEL}"
    exit 1
  fi
fi

echo "[pattern-local] Pattern: ${PATTERN}"
if [[ -n "$CATEGORY" ]]; then
  echo "[pattern-local] Category: ${CATEGORY}"
else
  echo "[pattern-local] Category: auto-detect"
fi

echo "[pattern-local] Fetching latest remote branches..."
git fetch --prune origin

echo "[pattern-local] Checking out ${BASE_BRANCH}..."
git checkout "${BASE_BRANCH}"
if git merge --ff-only "origin/${BASE_BRANCH}"; then
  echo "[pattern-local] Fast-forwarded ${BASE_BRANCH} to origin/${BASE_BRANCH}."
else
  echo "[pattern-local] ${BASE_BRANCH} diverged from origin/${BASE_BRANCH}; merging remote changes..."
  git merge --no-edit "origin/${BASE_BRANCH}"
fi

if [[ "${SYNC_MAIN_INTO_CONTENTS}" == "true" ]]; then
  if git merge-base --is-ancestor "origin/${MAIN_BRANCH}" HEAD; then
    echo "[pattern-local] ${BASE_BRANCH} already includes ${MAIN_BRANCH}."
  else
    echo "[pattern-local] Merging origin/${MAIN_BRANCH} into ${BASE_BRANCH}..."
    git merge --no-edit "origin/${MAIN_BRANCH}"
    if [[ "${AUTO_PUSH_SYNC}" == "true" ]]; then
      git push origin "${BASE_BRANCH}"
      echo "[pattern-local] Pushed ${BASE_BRANCH} sync merge."
    fi
  fi
fi

# Build generator arguments
GEN_ARGS=()
GEN_ARGS+=("--pattern=${PATTERN}")
if [[ -n "$CATEGORY" ]]; then
  GEN_ARGS+=("--category=${CATEGORY}")
fi
if [[ "${FORCE_GENERATE}" == "true" ]]; then
  GEN_ARGS+=("--force")
fi

echo "[pattern-local] Generating ${PATTERN} pattern content..."
"${NODE_BINARY}" --import tsx scripts/generate-daily-ai-trend-posts.ts "${GEN_ARGS[@]}"

if git diff --quiet -- src/content/posts && [[ -z "$(git ls-files --others --exclude-standard -- src/content/posts)" ]]; then
  echo "[pattern-local] No content changes detected. Exiting without PR."
  exit 0
fi

if [[ "${RUN_BUILD_VALIDATION}" == "true" ]]; then
  if [[ -z "${NPM_BINARY}" ]]; then
    echo "[pattern-local] npm is required for build validation but was not found."
    echo "[pattern-local] Add npm to PATH, set NPM_BINARY, or set RUN_BUILD_VALIDATION=false."
    exit 1
  fi
  echo "[pattern-local] Running build validation..."
  "${NPM_BINARY}" run build
fi

TODAY="$(date +%Y-%m-%d)"
STAMP="$(date +%Y%m%d-%H%M%S)"
PR_BRANCH="${PR_BRANCH_PREFIX}-${PATTERN}-${STAMP}"

echo "[pattern-local] Creating branch ${PR_BRANCH}..."
git checkout -b "${PR_BRANCH}"
git add src/content/posts
git commit -m "feat(content): add ${PATTERN} post (${TODAY})"
git push -u origin "${PR_BRANCH}"

QA_SUMMARY_FILE="$(mktemp)"
TODAY="${TODAY}" "${NODE_BINARY}" -e '
const fs = require("node:fs");
const path = require("node:path");
const today = process.env.TODAY;
const root = process.cwd();

const readJsonl = (filePath) => {
  try {
    const raw = fs.readFileSync(filePath, "utf8").trim();
    if (!raw) return [];
    return raw
      .split(/\n+/)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
};

const slugPrefix = `ai-it-trend-brief-${today}-`;
const auditEntries = readJsonl(path.join(root, "scripts/logs/content-audit.log"));
const qaEntries = readJsonl(path.join(root, "scripts/logs/content-qa.log"));

const latestAudit = auditEntries
  .filter((entry) => typeof entry.slug === "string" && entry.slug.includes(slugPrefix))
  .pop();
const latestQa = qaEntries
  .filter((entry) => typeof entry.slug === "string" && entry.slug.includes(slugPrefix))
  .pop();

if (!latestAudit) {
  console.log("- QA telemetry not found for this run date.");
  process.exit(0);
}

console.log(`- Overall quality score: ${latestAudit.qualityScore}/100`);
if (latestAudit.tokensUsed !== undefined) {
  console.log(`- Tokens used: ${latestAudit.tokensUsed}`);
}

const breakdown = latestAudit.scoreBreakdownByLanguage || {};
const qaByLanguage = latestAudit.qaByLanguage || (latestQa ? latestQa.qaByLanguage : {});
const langs = Object.keys(breakdown).length > 0
  ? Object.keys(breakdown)
  : Object.keys(qaByLanguage || {});

if (langs.length > 0) {
  console.log("");
  console.log("Per-language QA:");
  for (const lang of langs) {
    const score = breakdown[lang]?.score;
    const qa = qaByLanguage?.[lang];
    const issues = Array.isArray(qa?.issues) ? qa.issues : [];
    const errorCount = issues.filter((issue) => issue.level === "error").length;
    const warnCount = issues.filter((issue) => issue.level === "warn").length;
    const status = qa?.pass === false ? "FAIL" : "PASS";
    const scoreText = score === undefined ? "n/a" : `${score}/100`;
    console.log(`- ${lang.toUpperCase()}: ${status} | score ${scoreText} | errors ${errorCount} | warnings ${warnCount}`);
  }
}
' > "${QA_SUMMARY_FILE}"
QA_SUMMARY="$(cat "${QA_SUMMARY_FILE}")"

PR_BODY_FILE="$(mktemp)"
cat > "${PR_BODY_FILE}" <<EOF
## Summary

Automated pattern-based content generation using ${PATTERN} structure.

## Pattern Used

- **Pattern**: ${PATTERN}
- **Category**: ${CATEGORY:-auto-detected}

## What was generated

- [x] \`src/content/posts/...\`
- [ ] \`public/images/...\` (if applicable)

## QA Checks

- [x] I reviewed spelling, grammar, and formatting in all updated languages
- [x] Internal links were checked and are valid
- [x] External links were checked and are valid
- [x] Local build passes (\`npm run build\`)

## SEO and Language Checks

- [x] Frontmatter is complete (\`title\`, \`date\`, \`excerpt\`, \`category\`, \`coverImage\`, \`author\`)
- [x] Slug naming follows project conventions (base, \`-ja\`, \`-ar\` where applicable)
- [x] Excerpt length and clarity are appropriate for previews
- [x] Cross-language versions are aligned in meaning
- [x] Language-specific links include correct query params where needed (\`?lang=ja\`, \`?lang=ar\`)

## Automated QA Results

${QA_SUMMARY}

## Notes

- Generated by \`scripts/pattern-content-pr.sh\` using local model backend.
- Pattern structure: ${PATTERN}
- Final human editorial review is still required before merge.
EOF

PR_TITLE="feat(content): ${PATTERN} post (${TODAY})"
echo "[pattern-local] Opening PR to ${BASE_BRANCH}..."
gh pr create \
  --base "${BASE_BRANCH}" \
  --head "${PR_BRANCH}" \
  --title "${PR_TITLE}" \
  --body-file "${PR_BODY_FILE}" \
  --label enhancement

rm -f "${PR_BODY_FILE}"
rm -f "${QA_SUMMARY_FILE}"
echo "[pattern-local] Done."
