# NeoWhisper - Modern Tech Blog

> Latest stable release: **v1.16.0**
> (`dev` may contain unreleased changes; semantic-release cuts the next
> version when merged to `main`)

A high-performance, SEO-optimized tech blog built with **Next.js 16**,
**App Router**, and **MDX**.

Features trilingual support (**English**, **日本語**, **العربية**)
and a premium, modern aesthetic.

## ✨ Key Features

- **Next.js 16 & MDX**:
  Blazing fast performance with Server Components and static generation.
- **Reusable Blog Template**:
  Consistent, premium article layout with automatic reading time calculation.
- **Category Navigation**:
  Modern glassmorphism navigation bar for easy content discovery.
- **Trilingual Support**:
  Built-in infrastructure for English, Japanese, and Arabic (RTL) content.
- **Syntax Highlighting**:
  Beautiful code blocks with `rehype-highlight` and `highlight.js`.
- **Google Analytics (GA4)**:
  Robust tracking with secure environment variable configuration.
- **SEO Optimized**:
  Built-in metadata, semantic HTML, and structured content strategy.
- **Multilingual SEO**:
  Automatic hreflang tags for English, Japanese, and Arabic,
  plus Open Graph alternateLocale support.
- **Related Posts**:
  Smart content discovery with category and language-aware recommendations.
- **Performance Optimized**:
  Responsive image optimization, efficient font loading,
  and layout tuned for Core Web Vitals.
- **Sitemap & Robots**:
  Pre-generated `sitemap.xml` and `robots.txt`
  to guide search engine crawlers.

## 🛠️ Getting Started

### Prerequisites

- Node.js 24.x
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/NeoWhisper/neowhisper-blog.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_GA_ID=your-ga-id
   NEXT_PUBLIC_ADSENSE_ID=your-adsense-id
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   # Comma-separated allowlist for /admin access
   ADMIN_EMAILS=you@example.com
   RESEND_API_KEY=your-resend-api-key
   RESEND_FROM="Your Name <hello@yourdomain.com>"
   # Inbox that receives contact form submissions (comma-separated supported)
   RESEND_TO=your-inbox@example.com
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
   TURNSTILE_SECRET_KEY=your-turnstile-secret-key
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the result.

### Admin Auth (Phase 1)

- Enable GitHub OAuth in Supabase Auth providers.
- Add `http://localhost:3000/auth/callback`
  and your production callback URL in Supabase redirect URLs.
- `/admin` routes are protected by Supabase session + `ADMIN_EMAILS` allowlist.

### Email Subscription Delivery

- The blog page includes a localized subscription form that sends requests to `/api/subscribe`.
- Subscriber preference is stored as `en`, `ja`, or `ar`, and each user receives only that language in email updates.
- Create this table in Supabase:

```sql
create table if not exists public.post_subscribers (
  email text primary key,
  lang text not null default 'en',
  subscribed_at timestamptz not null default now(),
  last_sent_slug text,
  last_sent_published_at timestamptz,
  updated_at timestamptz not null default now()
);
```

- Send new-post updates to subscribers:

```bash
npm run send:subscribers
```

## 📝 Writing Posts

Create new posts in `src/content/posts/` using the `.mdx` extension.
Use the following frontmatter:

```md
---
title: "Article Title"
date: "2026-01-14"
excerpt: "Brief summary of the article."
category: "Tutorial"
coverImage: "/images/your-image.png"
author:
  name: "NeoWhisper"
  picture: "/images/author.png"
---
```

## AdSense Remediation Mode

The site is currently optimized for a cleaner AdSense re-review corpus:

- AI trend brief posts are conservative by default. Short briefs, and briefs
  still using `/og-image.jpg`, are served with `noindex` and excluded from the
  sitemap.
- New staged posts must be more than 900 words before commit checks pass.
- Keep generated briefs source-grounded, human-reviewed, and supported by a
  distinctive cover image before allowing them into the index.

Environment overrides:

```env
# Default: true. Set to false only after thin/generated briefs are remediated.
BRIEF_NOINDEX_ENABLED=true

# Default: 900. Hard floor: 600.
BRIEF_NOINDEX_MIN_WORDS=900
```

Operational notes from local logs:

- Recent daily content runs failed because local/remote model endpoints were
  unavailable, overloaded, or too large for available system resources.
- Treat generated trend posts as drafts until editorial QA confirms depth,
  citations, image uniqueness, and language quality.
- Keep `.logs/`, `scripts/logs/*.json`, and local audit reports out of commits;
  summarize actionable findings in tracked docs instead.

## 🤖 Daily AI Content Automation (EN/JA/AR)

This repository includes a multilingual draft generator that can run:

- in GitHub Actions (cloud/API mode), or
- fully local on your Mac with Ollama (free local mode).

- Workflow: `.github/workflows/daily-ai-content.yml`
- Generator script: `scripts/generate-daily-ai-trend-posts.ts`
- Local auto-PR script: `scripts/local-daily-content-pr.sh`
- Local scheduler installer (macOS): `scripts/install-launchd-daily-content.sh`
- Local main sync script: `scripts/sync-local-main.sh`
- Local main sync installer (macOS): `scripts/install-launchd-sync-main.sh`

### Free local mode (Ollama on macOS)

1. Start Ollama and pull a model:

   ```bash
   ollama serve
   ollama pull qwen3:14b
   ```

2. Authenticate GitHub CLI for PR creation:

   ```bash
   gh auth login
   ```

3. Run once manually
   (syncs `contents` with `main`, generates post, builds, opens PR):

   ```bash
   OPENAI_BASE_URL=http://127.0.0.1:11434/v1 \
   OPENAI_MODEL=qwen3:14b \
   OPENAI_API_MODE=local \
   npm run content:daily:pr
   ```

4. Install daily schedule (default 09:30 local time):

   ```bash
   OPENAI_BASE_URL=http://127.0.0.1:11434/v1 \
   OPENAI_MODEL=qwen3.6:latest \
   OPENAI_API_MODE=local \
   npm run content:daily:install-launchd
   ```

### Local LM Studio mode (macOS)

1. Start LM Studio and load a model (e.g., `qwen3.6-35b-a3b-ud-mlx`).
2. Start the Local Inference Server in LM Studio (default port 1234).
3. Run once manually:

   ```bash
   OPENAI_BASE_URL=http://127.0.0.1:1234/v1 \
   OPENAI_MODEL=qwen3.6-35b-a3b-ud-mlx \
   OLLAMA_BASE_URL=http://127.0.0.1:11434 \
   npm run content:daily:pr
   ```

4. Install daily schedule:

   ```bash
   OPENAI_BASE_URL=http://127.0.0.1:1234/v1 \
   OPENAI_MODEL=qwen3.6-35b-a3b-ud-mlx \
   OLLAMA_BASE_URL=http://127.0.0.1:11434 \
   npm run content:daily:install-launchd
   ```

5. Optional: keep local `main` synced daily (default 09:00 local time):

   ```bash
   npm run content:sync-main:install-launchd
   ```

6. Trigger scheduled job immediately (optional):

   ```bash
   launchctl kickstart -k gui/$(id -u)/net.neowhisper.daily-content
   ```

Notes:

- The local PR script always starts from `contents`, fetches remotes,
  and merges `origin/main` into `contents` when needed before generation.
- `content:sync-main` fast-forwards local `main` to `origin/main`
  without switching your current branch.
- Set `FORCE_GENERATE=true` if you want a same-day variant slug.
- Set `PR_BRANCH_PREFIX` to customize PR branch names
  (default: `daily-ai-content`).

### Cloud/API mode (optional)

1. Add repository secret:
   - `OPENAI_API_KEY` (required for official OpenAI endpoint)
2. Optional repository variable:
   - `OPENAI_BASE_URL` (default: `https://api.openai.com/v1`)
   - `OPENAI_MODEL` (default: `gpt-4.1-mini`)
   - `OPENAI_API_MODE` (default: `auto`)
3. Merge the workflow into your default branch (`main`)
   so GitHub `schedule` can run automatically.

### Manual run

Run generator only (no PR automation):

```bash
npm run content:daily
```

Optional options:

- `--force`: generate a same-day variant if today's slug already exists
- `--lang=en|ja|ar`: generate only one language variant
- `TOPIC_HINT="your angle"`: guide the editorial angle for that day
- `TREND_MIN_SOURCES=2`: temporarily lower required source count (default: `3`)
- `TREND_RECENT_DAYS=5`: bias source picking toward recent items (default: `3`)
- `CONTENT_QA_MIN_SCORE=75`: raise/lower the blocking quality threshold (default: `70`)
- `CONTENT_QA_STRICT=false`: allow PR creation even if QA has blocking issues (default: strict mode on)

Daily PR scripts (`content:daily:pr` and `content:pattern:pr`) now include an
`Automated QA Results` section sourced from `scripts/logs/content-audit.log` and
`scripts/logs/content-qa.log`.

Validate config/schema only (no feed fetch, no generation):

```bash
npm run content:check
```

Example:

```bash
OPENAI_BASE_URL=http://127.0.0.1:11434/v1 \
OPENAI_MODEL=qwen3:14b OPENAI_API_MODE=local \
TOPIC_HINT="AI security and infra economics" npm run content:daily -- --force
```

Final human review is still recommended
for factual precision and brand tone before merge.

## 🔒 Content Security Policy (CSP) for AdSense

This site uses a Content Security Policy to allow Google AdSense,
Analytics, and Cloudflare Turnstile while maintaining security.
The CSP is configured in `src/proxy.ts`.

**Required domains for AdSense:**

- `script-src`: Inline scripts for Next.js hydration,
  plus Google Tag Manager, Analytics, AdSense, and Turnstile
- `connect-src`: API calls to Google Analytics,
  AdSense verification, and Turnstile
- `frame-src`: iframes for AdSense ads,
  Turnstile challenges, and Google ad serving

**If you see CSP errors in DevTools:**

1. Open DevTools Console with ad blockers disabled
2. Look for "Content Security Policy" errors
3. Add only the blocked domain to the appropriate directive in `src/proxy.ts`
4. Never use wildcard `*` - always specify exact domains

**Current allowed domains:**

- Google Analytics: `www.google-analytics.com`, `www.googletagmanager.com`
- AdSense: `pagead2.googlesyndication.com`, `googleads.g.doubleclick.net`,
  `tpc.googlesyndication.com`, `*.google.com`, `adtrafficquality.google`,
  `*.adtrafficquality.google`, `fundingchoicesmessages.google.com`
- Turnstile: `challenges.cloudflare.com`

## 🧩 Turnstile Troubleshooting

- If DevTools shows `TurnstileError: 110200` with repeated `400` requests
  to `challenges.cloudflare.com`, your current hostname is not allowed.
- In Cloudflare Turnstile dashboard, add all active hostnames
  (for example: `localhost`, `127.0.0.1`, production, and preview domains).
- Keep widget key/secret key pairs matched by environment.
  Use separate widget keys for local/dev and production.

## 🚀 Deploy on Vercel

Push to your main branch and connect to [Vercel](https://vercel.com/new)
for automatic deployments.

## 🧪 End-to-end tests (Playwright) ✅

There are two ways to run the Playwright E2E tests locally:

1. **Playwright-managed server** (recommended for CI / fresh runs)

   - Install Playwright browsers: `npx playwright install`
   - Run tests: `npm run test:e2e`
   - Playwright will start `npm run dev`, run tests, then stop the server.
     The Playwright config can also reuse an existing server.

2. **Use an existing dev server** (recommended for iterative local development)

   - Start dev in one terminal: `npm run dev`
   - In another terminal run: `npm run test:e2e`
   - Because `playwright.config.ts` uses `reuseExistingServer: true`,
     Playwright uses the running server instead of starting a new one.

**Troubleshooting:**

- If you see "port 3000 is already used" or Next lock errors,
  ensure no other `next dev` instances are running.
  (`lsof -i :3000` helps identify listeners.)
- First-time setup:
  run `npx playwright install` to download browser binaries.

## 🔒 Production security scan (weekly)

A scheduled GitHub Action runs weekly
(and on pushes to `main`) to verify security headers and static asset config:
CSP, `X-Frame-Options`, `X-Content-Type-Options`,
plus metadata-route CORS behavior for `robots.txt`/`sitemap.xml`.
If regressions are detected, logs are uploaded as workflow artifacts,
and it **automatically opens a GitHub issue** with the scan output.
To change behavior, edit `.github/workflows/production-security-scan.yml`
(uses `GITHUB_TOKEN`).
You can also redirect alerts to Slack or email instead of creating issues.

---

Built with ❤️ by **NeoWhisper**
