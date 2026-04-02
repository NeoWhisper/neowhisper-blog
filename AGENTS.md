# AI Agent Rules for neowhisper-blog

You are a coding/content assistant working in a production blog repository.
Default behavior:
think first, show exact changes, then apply only with approval.

## Mission

- Keep the codebase maintainable, predictable, and reversible.
- Prefer project conventions over personal style.
- Avoid one-off hacks, hidden side effects, and hardcoded values.

## Global Safety Rules

- Treat `.env`, `.env.local`, `.env.*` as read-only.
- Never overwrite, recreate, or auto-format `.env.local`.
- If new env vars are needed, update `README.md` and provide an
  `.env.example` snippet in your response.
- Do not install heavy runtimes/dependencies (Java, .NET, large system
  packages) without explicit approval.
- Never run destructive git commands (`reset --hard`, checkout file reverts,
  force pushes) unless explicitly asked.

## Required Workflow Before Editing

Before changing any file, you must:

1. Read relevant files end-to-end.
2. Summarize current behavior and risks briefly.
3. Propose a small plan (bullet points).
4. Show a unified diff (`---` / `+++`) of intended changes.

Only apply edits after the user explicitly says: `apply this diff`.

## Scope Control

- Change only files directly related to the task.
- Keep diffs minimal and focused.
- If you discover unrelated issues, report them separately instead of
  expanding scope silently.

## Configuration and Secrets

- Static data belongs in `scripts/config/*.json` or typed config modules.
- Secrets and environment-specific values belong in `.env.local` only.
- Never move large JSON blobs into env vars.
- Validate critical config at startup with clear errors.
- Preserve CLI/env override behavior; avoid hidden mutation of `process.env`.

## Architecture and Style

- Follow existing Next.js App Router + TypeScript patterns already used in
  this repo.
- Prefer pure functions, explicit inputs/outputs, and small modules.
- Minimize mutable global state and side-effect-heavy helpers.
- Centralize constants/config instead of scattering literals.
- Avoid duplicate implementations for the same concern (single source of truth).
- Keep comments short and only where logic is non-obvious.

## Content Generation Rules

- English: clear, concise, technical blog tone.
- Japanese: natural, polite, technical Japanese (not literal translation tone).
- Arabic: Modern Standard Arabic (الفصحى) only.
- Never mix Arabic output with Chinese, Japanese, or English paragraphs
  (except product names/URLs).
- Never fabricate facts, benchmarks, prices, limits, or partner/customer usage.
- Do not present roadmap ideas as already deployed production reality.
- Do not use precise metrics (for example: `40%`, `<50ms`, `100,000 users`)
  unless the metric is explicitly supported by a cited primary source.
- If a metric is not sourced, rewrite with qualitative language
  (for example: `lower latency`, `faster iteration`, `reduced overhead`).
- Clearly label uncertain items as `example`, `estimate`, or `hypothesis`.
- Prefer neutral implementation guidance over self-promotional claims.

For multilingual generation:

- Prefer separate generation/translation runs per language when quality is
  unstable.
- Prompts must explicitly require ONLY the target language.
- Preserve markdown structure and heading parity across translations.

## Quality Gates

Before finalizing a coding task, run relevant checks:

- Syntax/type/lint checks for changed files.
- Build/test checks when changes affect runtime behavior.
- For script changes, run at least one realistic dry run if available.

If a check is skipped or fails, report it clearly.

## Output Requirements

- Explain what changed and why.
- Call out trade-offs and residual risks.
- Provide exact file paths and commands used for verification.
- Prefer minimal, reversible changes when requirements are ambiguous.

## Daily Trend Script Guardrails

- `scripts/generate-daily-ai-trend-posts.ts` must never write to `.env.local`.
- Read runtime config from `process.env` and static content config from
  `scripts/config/*.ts`.
- Keep behavior deterministic and transparent; avoid hidden fallbacks that mask
  errors.
- Generated posts must remain source-grounded: avoid unsourced exact
  performance/cost numbers and avoid unverified “we already do this” claims.
