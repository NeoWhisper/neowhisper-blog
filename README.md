# NeoWhisper - Modern Tech Blog

> Current version: **v1.5.0**

A high-performance, SEO-optimized tech blog built with **Next.js 16**, **App Router**, and **MDX**.

Features trilingual support (**English**, **日本語**, **العربية**) and a premium, modern aesthetic.

## ✨ Key Features

- **Next.js 16 & MDX**: Blazing fast performance with Server Components and static generation.
- **Reusable Blog Template**: Consistent, premium article layout with automatic reading time calculation.
- **Category Navigation**: Modern glassmorphism navigation bar for easy content discovery.
- **Trilingual Support**: Built-in infrastructure for English, Japanese, and Arabic (RTL) content.
- **Syntax Highlighting**: Beautiful code blocks with `rehype-highlight` and `highlight.js`.
- **Google Analytics (GA4)**: Robust tracking with secure environment variable configuration.
- **SEO Optimized**: Built-in metadata, semantic HTML, and structured content strategy.
- **Multilingual SEO**: Automatic hreflang tags for English, Japanese, and Arabic, plus Open Graph alternateLocale support.
- **Related Posts**: Smart content discovery with category and language-aware recommendations.
- **Performance Optimized**: Responsive image optimization, efficient font loading, and layout tuned for Core Web Vitals.
- **Sitemap & Robots**: Pre-generated `sitemap.xml` and `robots.txt` to guide search engine crawlers.

## 🛠️ Getting Started

### Prerequisites

- Node.js 20.9 or newer
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
   RESEND_API_KEY=your-resend-api-key
   RESEND_FROM="NeoWhisper <no-reply@yourdomain.com>"
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

## 📝 Writing Posts

Create new posts in `src/content/posts/` using the `.mdx` extension. Use the following frontmatter:

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

## 🚀 Deploy on Vercel

Push to your main branch and connect to [Vercel](https://vercel.com/new) for automatic deployments.

## 🧪 End-to-end tests (Playwright) ✅

There are two ways to run the Playwright E2E tests locally:

1. **Playwright-managed server** (recommended for CI / fresh runs)

   - Install Playwright browsers: `npx playwright install`
   - Run tests: `npm run test:e2e`
   - Playwright will start `npm run dev`, run the tests, then stop the server. The Playwright config also allows reusing an existing server if one is already running.

2. **Use an existing dev server** (recommended for iterative local development)

   - Start dev in one terminal: `npm run dev`
   - In another terminal run: `npm run test:e2e`
   - Because `playwright.config.ts` is configured with `reuseExistingServer: true`, Playwright will use the running server instead of starting a new one.

**Troubleshooting:**

- If you see "port 3000 is already used" or Next's lock error, ensure no other `next dev` instances are running (`lsof -i :3000` helps identify listeners).
- First-time setup: after installing dependencies, run `npx playwright install` to download browser binaries.

## 🔒 Production security scan (weekly)

A scheduled GitHub Action runs weekly (and on pushes to `main`) to verify critical security headers and static asset configuration (CSP, `X-Frame-Options`, `X-Content-Type-Options`, and absence of `Access-Control-Allow-Origin` on `robots.txt`/`sitemap.xml`). If the scan detects regressions, it uploads logs as workflow artifacts and **automatically opens a GitHub issue** with the scan output so regressions are visible and tracked. To change this behavior edit `.github/workflows/production-security-scan.yml` (it uses `GITHUB_TOKEN`); you can also redirect alerts to Slack or email instead of creating issues.

---

Built with ❤️ by **NeoWhisper**
