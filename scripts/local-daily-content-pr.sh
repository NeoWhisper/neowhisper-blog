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

if [[ -f "${REPO_ROOT}/.env.local" ]]; then
  set -a
  source "${REPO_ROOT}/.env.local"
  set +a
fi

OPENAI_BASE_URL="${OPENAI_BASE_URL:-http://127.0.0.1:11434/v1}"
OPENAI_MODEL="${OPENAI_MODEL:-gpt-oss:20b}"
OPENAI_API_MODE="${OPENAI_API_MODE:-chat}"
OPENAI_API_KEY="${OPENAI_API_KEY:-sk-local}"
NODE_BINARY="${NODE_BINARY:-$(command -v node || true)}"
NPM_BINARY="${NPM_BINARY:-$(command -v npm || true)}"

export OPENAI_BASE_URL
export OPENAI_MODEL
export OPENAI_API_MODE
export OPENAI_API_KEY

if [[ -z "${NODE_BINARY}" ]]; then
  echo "[daily-local] Node.js is required but was not found."
  echo "[daily-local] Add node to PATH or set NODE_BINARY."
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "[daily-local] GitHub CLI (gh) is required."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "[daily-local] gh is not authenticated. Run: gh auth login"
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "[daily-local] Working tree is not clean. Commit or stash changes before running."
  exit 1
fi

if [[ "$OPENAI_BASE_URL" == http://127.0.0.1:* || "$OPENAI_BASE_URL" == http://localhost:* ]]; then
  OLLAMA_BASE="${OPENAI_BASE_URL%/v1}"
  OLLAMA_TAGS_JSON="$(curl -fsS "${OLLAMA_BASE}/api/tags" || true)"
  if [[ -z "${OLLAMA_TAGS_JSON}" ]]; then
    echo "[daily-local] Ollama endpoint is not reachable at ${OLLAMA_BASE}."
    echo "[daily-local] Start Ollama first (for example: ollama serve)."
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
    echo "[daily-local] Model '${OPENAI_MODEL}' is not installed in Ollama."
    echo "[daily-local] Install it first, for example: ollama pull ${OPENAI_MODEL}"
    exit 1
  fi
fi

echo "[daily-local] Fetching latest remote branches..."
git fetch --prune origin

echo "[daily-local] Checking out ${BASE_BRANCH}..."
git checkout "${BASE_BRANCH}"
if git merge --ff-only "origin/${BASE_BRANCH}"; then
  echo "[daily-local] Fast-forwarded ${BASE_BRANCH} to origin/${BASE_BRANCH}."
else
  echo "[daily-local] ${BASE_BRANCH} diverged from origin/${BASE_BRANCH}; merging remote changes..."
  git merge --no-edit "origin/${BASE_BRANCH}"
fi

if [[ "${SYNC_MAIN_INTO_CONTENTS}" == "true" ]]; then
  if git merge-base --is-ancestor "origin/${MAIN_BRANCH}" HEAD; then
    echo "[daily-local] ${BASE_BRANCH} already includes ${MAIN_BRANCH}."
  else
    echo "[daily-local] Merging origin/${MAIN_BRANCH} into ${BASE_BRANCH}..."
    git merge --no-edit "origin/${MAIN_BRANCH}"
    if [[ "${AUTO_PUSH_SYNC}" == "true" ]]; then
      git push origin "${BASE_BRANCH}"
      echo "[daily-local] Pushed ${BASE_BRANCH} sync merge."
    fi
  fi
fi

GEN_ARGS=()
if [[ "${FORCE_GENERATE}" == "true" ]]; then
  GEN_ARGS+=(--force)
fi

echo "[daily-local] Generating daily EN/JA/AR drafts..."
if (( ${#GEN_ARGS[@]} > 0 )); then
  "${NODE_BINARY}" scripts/generate-daily-ai-trend-posts.mjs "${GEN_ARGS[@]}"
else
  "${NODE_BINARY}" scripts/generate-daily-ai-trend-posts.mjs
fi

if git diff --quiet -- src/content/posts && [[ -z "$(git ls-files --others --exclude-standard -- src/content/posts)" ]]; then
  echo "[daily-local] No content changes detected. Exiting without PR."
  exit 0
fi

if [[ "${RUN_BUILD_VALIDATION}" == "true" ]]; then
  if [[ -z "${NPM_BINARY}" ]]; then
    echo "[daily-local] npm is required for build validation but was not found."
    echo "[daily-local] Add npm to PATH, set NPM_BINARY, or set RUN_BUILD_VALIDATION=false."
    exit 1
  fi
  echo "[daily-local] Running build validation..."
  "${NPM_BINARY}" run build
fi

TODAY="$(date +%Y-%m-%d)"
STAMP="$(date +%Y%m%d-%H%M%S)"
PR_BRANCH="codex/daily-ai-content-${STAMP}"

echo "[daily-local] Creating branch ${PR_BRANCH}..."
git checkout -b "${PR_BRANCH}"
git add src/content/posts
git commit -m "feat(content): add daily AI trend draft (${TODAY})"
git push -u origin "${PR_BRANCH}"

PR_BODY_FILE="$(mktemp)"
cat > "${PR_BODY_FILE}" <<'EOF'
## Summary

Automated local Ollama-based draft generation for one AI/IT trend brief in English, Japanese, and Arabic.

## What was generated

- [x] `src/content/posts/...`
- [ ] `public/images/...` (if applicable)

## QA Checks

- [x] I reviewed spelling, grammar, and formatting in all updated languages
- [x] Internal links were checked and are valid
- [x] External links were checked and are valid
- [x] Local build passes (`npm run build`)

## SEO and Language Checks

- [x] Frontmatter is complete (`title`, `date`, `excerpt`, `category`, `coverImage`, `author`)
- [x] Slug naming follows project conventions (base, `-ja`, `-ar` where applicable)
- [x] Excerpt length and clarity are appropriate for previews
- [x] Cross-language versions are aligned in meaning
- [x] Language-specific links include correct query params where needed (`?lang=ja`, `?lang=ar`)

## Notes

- Generated by `scripts/local-daily-content-pr.sh` using local model backend.
- This run synced `contents` with `main` first (when needed).
- Final human editorial review is still required before merge.
EOF

PR_TITLE="feat(content): daily AI trend draft (${TODAY})"
echo "[daily-local] Opening PR to ${BASE_BRANCH}..."
gh pr create \
  --base "${BASE_BRANCH}" \
  --head "${PR_BRANCH}" \
  --title "${PR_TITLE}" \
  --body-file "${PR_BODY_FILE}" \
  --label enhancement

rm -f "${PR_BODY_FILE}"
echo "[daily-local] Done."
