# [1.12.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.11.5...v1.12.0) (2026-03-01)


### Features

* **posts:** add multilingual Next.js production debugging playbook and PR templates ([#35](https://github.com/NeoWhisper/neowhisper-blog/issues/35)) ([669e631](https://github.com/NeoWhisper/neowhisper-blog/commit/669e6312a0b1df10c0c91261f524112c8bf463de))

## [1.11.5](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.11.4...v1.11.5) (2026-03-01)


### Bug Fixes

* harden blog slug route against production import/render failures ([5c3cad9](https://github.com/NeoWhisper/neowhisper-blog/commit/5c3cad919caace47a5e1b69c37ec79e186f17d8e))

## [1.11.4](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.11.3...v1.11.4) (2026-02-27)


### Bug Fixes

* remove logger from catch block and decode slug to fix 500 errors on all blog posts ([297ce4b](https://github.com/NeoWhisper/neowhisper-blog/commit/297ce4b3c829c31a4bc309046be7134efad68dec))

## [1.11.3](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.11.2...v1.11.3) (2026-02-27)


### Bug Fixes

* remove unused toOpenGraphLocale function ([8f71430](https://github.com/NeoWhisper/neowhisper-blog/commit/8f71430a77b1d21aa7fe169aaa271660a20a79f8))

## [1.11.2](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.11.1...v1.11.2) (2026-02-25)


### Bug Fixes

* nuclear stability patch for blog page 500 errors ([f245912](https://github.com/NeoWhisper/neowhisper-blog/commit/f245912c14a7754c66e4bbec7a8e6e3ced8f0c38))

## [1.11.1](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.11.0...v1.11.1) (2026-02-25)


### Bug Fixes

* make blog page and logger fault-tolerant to prevent 500 errors ([9b51662](https://github.com/NeoWhisper/neowhisper-blog/commit/9b516627ea5340d60ec9ef99763dd7a4475a4e4a))

# [1.11.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.10.0...v1.11.0) (2026-02-25)


### Features

* consolidate admin features, supabase logging, and contact ux improvements ([#34](https://github.com/NeoWhisper/neowhisper-blog/issues/34)) ([37d9a95](https://github.com/NeoWhisper/neowhisper-blog/commit/37d9a95189138a77d31cec5e007c39bab6674709)), closes [#23](https://github.com/NeoWhisper/neowhisper-blog/issues/23)

# Changelog

All notable changes to the NeoWhisper blog will be documented here.

## [Unreleased]

* Code quality: Removed if statements from remaining components (`ArticleCard.tsx` and `BlogPostTemplate.tsx`).
* Admin dashboard: Refactored `AdminPage` for dynamic hydration from URL params and functional state initialization.
* Bug fix: Resolved TypeScript/ESLint standalone expression errors in `posts-table.tsx` and `edit-form.tsx` using `void` ternary pattern.
* Security: Updated CSP to whitelist Perplexity CDN (`r2cdn.perplexity.ai`) and additional Google AdSense domains, resolving font and script blocking errors.
* Observability: Implemented a persistent, Supabase-backed logging system (`src/lib/logger.ts`) to capture production errors with stack traces.
* Admin Dashboard: Added a new "Error Logs" management page (`/admin/logs`) to review system errors recorded in the database.
* Refactoring: Satisfied React linting rules by decoupling data fetching from JSX construction in dynamic blog pages.
* Observability: Added standardized client and server-side logging for all admin actions (create, update, delete, status change).
* Trust copy (JA): Replaced ambiguous "登録済み" business claims with clearer legal phrasing based on 開業届提出済み status in `about` and `AuthorBio`.
* Contact UX: Added client-side Turnstile token guard with localized error messages (EN/JA/AR) to avoid noisy failed submissions when captcha is not completed.
* **content-quality:** strengthen trust pages and reduce thin-indexed content ([43fb039](https://github.com/NeoWhisper/neowhisper-blog/commit/43fb03984c46f64707dd0e622442078c5b8fa351))
* Cross-reference: Builds on the CSP and header cleanup from merged branch `fix/changelog-fonts-tests-refactor`.

## [1.10.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.9.0...v1.10.0) (2026-02-24)

### Features

* admin posts management, release workflow fixes, and security updates ([#26](https://github.com/NeoWhisper/neowhisper-blog/issues/26)) ([a411693](https://github.com/NeoWhisper/neowhisper-blog/commit/a4116934522392012d237f69ea214ba3d4dc6dab)), closes [#23](https://github.com/NeoWhisper/neowhisper-blog/issues/23)
* release Supabase Hybrid CMS Phase 1, refactor, and update CI ([#24](https://github.com/NeoWhisper/neowhisper-blog/issues/24)) ([792a2e7](https://github.com/NeoWhisper/neowhisper-blog/commit/792a2e7ad6c867614c4975df793397248c9e8b50)), closes [#23](https://github.com/NeoWhisper/neowhisper-blog/issues/23)

## [1.8.2](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.8.1...v1.8.2) (2026-02-16)

### Bug Fixes

* **seo:** use existing logo asset in blog structured data ([8b0decc](https://github.com/NeoWhisper/neowhisper-blog/commit/8b0decc21090f62c108a3c2e26aa2f294bd4bc40))

## [1.8.1](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.8.0...v1.8.1) (2026-02-16)

### Bug Fixes

* **adsense:** remove stray markdown from ads.txt ([347062e](https://github.com/NeoWhisper/neowhisper-blog/commit/347062ef2cbbdcaea074dff07f8f57dcb1e5469c))

## [1.8.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.7.0...v1.8.0) (2026-02-16)

### Features

* **site:** refine multilingual positioning and roadmap timeline ([e3494a2](https://github.com/NeoWhisper/neowhisper-blog/commit/e3494a23c8c4315830c6d95ab32d5387ca4890d5))

<!-- markdownlint-disable MD024 -->
## [1.7.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.6.1...v1.7.0) (2026-02-16)

### 🎉 AdSense Readiness Milestone

This release completes all critical requirements for Google AdSense approval.

### Bug Fixes

* **security:** remove empty CORS headers from robots and sitemap ([112047d](https://github.com/NeoWhisper/neowhisper-blog/commit/112047db8c51e155d4e18a024dffe44b63c02e3b))
* **6 CSP errors** blocking AdSense scripts (frame-src, script-src, connect-src violations)
* **Email deliverability** - Changed RESEND_FROM to friendly address, configured DMARC
* **CSP configuration** - Added all required Google domains for AdSense
* **Twitter/X link** removed from AuthorBio (replaced with real GitHub only)

### Features

* **business:** transition to professional service agency branding ([cbcd6eb](https://github.com/NeoWhisper/neowhisper-blog/commit/cbcd6ebee282e3bba26c3866fa4621d66ce2a374))
* **Blog Posts (2 new, bringing total to 6):**
  * "Building Production-Ready Contact Forms with Cloudflare Turnstile and Resend" (EN/JA/AR)
  * "From 6 CSP Errors to Zero: Debugging Content Security Policy for AdSense" (EN/JA/AR)
* **AuthorBio component** with E-E-A-T signals (expertise, authority, trust)
* **CookieBanner component** with GDPR compliance and multilingual support
* **Internal links** added to all blog posts (15 files updated, 2-3 links per post)
* **SEO metadata** with i18n support for all marketing pages (Services, Projects, About, Contact)
* **DNS records** for email deliverability (SPF, DKIM, DMARC)
* **CSP documentation** section in README with troubleshooting guide

### Changed

* **README.md** kept generic for template reusability
* **DNS-SETUP-CHECKLIST.md** added to .gitignore (operational doc)
* **CSP policy** relaxed for AdSense while maintaining security (no wildcard *, specific domains only)
* **Welcome post** expanded with more substantive content and navigation links

### Infrastructure

* Email deliverability tested in production (Gmail/Outlook inbox delivery confirmed)
* All High-priority AdSense tasks completed (100%)
* All Critical tasks completed except final translations (75%)
* Total progress: 18% → 86% in 2 days

### Metrics

* Blog posts: 4 → 6 (target met)
* Internal links: 0 → 20+ (200% of target)
* CSP errors: 6 → 0 (100% resolved)
* Commits: 14 over 2 days
* Files changed: 40+
<!-- markdownlint-enable MD024 -->

## [1.6.1](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.6.0...v1.6.1) (2026-02-10)

### Bug Fixes

* **security:** resolve XSS and upgrade Next.js to 16.1.5 ([361700f](https://github.com/NeoWhisper/neowhisper-blog/commit/361700fc1ae6032a76f95fda176b6f65cc883cd6))

## [1.6.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.5.1...v1.6.0) (2026-02-09)

### Bug Fixes

* **api:** add robust validation for RESEND_FROM with fallback to onboarding email ([f8bc64b](https://github.com/NeoWhisper/neowhisper-blog/commit/f8bc64b64fdad79853dd1b498d8b9a5ec7bafcdd))
* **api:** improve request body parsing for Turnstile token and lang handling ([3e9af2b](https://github.com/NeoWhisper/neowhisper-blog/commit/3e9af2ba8541d1a9273fde1a1a1624a454cd55ce))
* **api:** improve Resend 'from' address handling and logging ([9bc85c5](https://github.com/NeoWhisper/neowhisper-blog/commit/9bc85c55706abba81bdb590b5edcea586e30d4ef))
* **ci:** update Node.js version to 22 for semantic-release ([1304342](https://github.com/NeoWhisper/neowhisper-blog/commit/13043427920999bb48553044277bfe301abb08dd))
* **contact:** avoid form reset crash after async submit ([4acd745](https://github.com/NeoWhisper/neowhisper-blog/commit/4acd7457fd4a3bf011c9385411a35c6e31fa96cf))
* **contact:** make form submit work without JS (no query params) ([ebb3472](https://github.com/NeoWhisper/neowhisper-blog/commit/ebb34720c1b2e7c55c20adef6ee28898cd53db3d))
* **csp:** add missing Google AdSense domains to eliminate console warnings ([45c936e](https://github.com/NeoWhisper/neowhisper-blog/commit/45c936e815ae63c1ae867f7ef3b85ade5ef8b663))
* resolve AdSense CSP errors by adding required Google domains ([d09bc9d](https://github.com/NeoWhisper/neowhisper-blog/commit/d09bc9d925717dac573cf79162b935af3526b3eb))
* resolve homepage build errors ([9c5bf71](https://github.com/NeoWhisper/neowhisper-blog/commit/9c5bf713c933b6efaa4869ea6c52bf7a06b5a6e0))
* **security:** relax CSP for hydration, Turnstile, and AdSense ([56d4296](https://github.com/NeoWhisper/neowhisper-blog/commit/56d4296c2ad456b6a3b211e17a55d625f0dcbb4d))
* **security:** restrict Access-Control-Allow-Origin for robots.txt and sitemap.xml ([7229175](https://github.com/NeoWhisper/neowhisper-blog/commit/722917520bf6c6090c449def95e8c6f6931907d2))
* **security:** set Access-Control-Allow-Origin to <https://www.neowhisper.net> for robots/sitemap ([436d61c](https://github.com/NeoWhisper/neowhisper-blog/commit/436d61cadfcd00a84d216cd5814918c6823a0065))
* **ui:** correct active tab highlighting in mobile and desktop navigation ([1ca33ca](https://github.com/NeoWhisper/neowhisper-blog/commit/1ca33ca937b916bf1b63a10756532204c4c47b4b))
* **ui:** prevent illegal invocation in Blog CTA; improve contact errors ([2091c1c](https://github.com/NeoWhisper/neowhisper-blog/commit/2091c1c3fb2b193236ec486bf7169b9c9b6b9067))
* update github-script action to v7 for better API compatibility ([94c51e1](https://github.com/NeoWhisper/neowhisper-blog/commit/94c51e16bf948ad7ac787b0932b06af483f86439))
* update Node.js version to 20+ and fix GitHub Actions workflows ([8c80ee3](https://github.com/NeoWhisper/neowhisper-blog/commit/8c80ee314ea4d6cc07f3fbb14b97d43de7af29cd))
* wrap SiteHeader in Suspense for prerender ([11f3814](https://github.com/NeoWhisper/neowhisper-blog/commit/11f3814a20a0273d1076a50511c606bd280247e4))

### Features

* add Author Bio component for E-E-A-T signals (AdSense H2) ([2fbd4fc](https://github.com/NeoWhisper/neowhisper-blog/commit/2fbd4fc3444a4692d02c687bc56997fc10b72a55))
* add blog post about production contact forms (Post #5) ([789209f](https://github.com/NeoWhisper/neowhisper-blog/commit/789209f40868334b363d4029360ae5d4654e0d48))
* add final blog post #6 about CSP debugging (EN only for now) ([a764787](https://github.com/NeoWhisper/neowhisper-blog/commit/a7647878579b5da80fc24bb817a31892fd98c93b))
* add GDPR-compliant Cookie Banner (AdSense H3) ([9e6bc13](https://github.com/NeoWhisper/neowhisper-blog/commit/9e6bc138254150f0bf6d3bddd09d469f73216c31))
* add internal links to all blog posts for AdSense compliance ([cb81d6e](https://github.com/NeoWhisper/neowhisper-blog/commit/cb81d6ecee48e516afd90d71525894b5ff35bfff))
* add JA/AR translations for contact forms post (Post #5 complete) ([ed92043](https://github.com/NeoWhisper/neowhisper-blog/commit/ed920435b2874d8bd1cb45b3f0fae2096397a478))
* add JA/AR translations for Post #6 - ALL POSTS NOW TRILINGUAL! ([f82e095](https://github.com/NeoWhisper/neowhisper-blog/commit/f82e095e1e97758aec2002699887f6e0b51626e3))
* add SEO metadata with i18n support to all marketing pages (AdSense H4) ([f95a849](https://github.com/NeoWhisper/neowhisper-blog/commit/f95a849a0b94a9d6e80fc51bbeba3aec81d0becb)), closes Hi#priority
* **ci:** add semantic-release with commitlint, husky, and dependabot ([1a3e774](https://github.com/NeoWhisper/neowhisper-blog/commit/1a3e774fb3f59c0a1227caee1de7c0f08aa8f2ee))
* **csp:** finalize AdSense & Turnstile readiness ([7be1d61](https://github.com/NeoWhisper/neowhisper-blog/commit/7be1d6146ad4d44c520ae2ed226af7b34c5a3d2f))
* **site:** add multilingual marketing pages, contact form, and project system ([3b59837](https://github.com/NeoWhisper/neowhisper-blog/commit/3b59837ad5b1873a4a8713a6fb1b1f44338fc20a))

## [Unreleased]

* Code quality: Removed if statements from remaining components (`ArticleCard.tsx` and `BlogPostTemplate.tsx`).
* Admin dashboard: Refactored `AdminPage` for dynamic hydration from URL params and functional state initialization.
* Bug fix: Resolved TypeScript/ESLint standalone expression errors in `posts-table.tsx` and `edit-form.tsx` using `void` ternary pattern.
* Security: Updated CSP to whitelist Perplexity CDN (`r2cdn.perplexity.ai`) and additional Google AdSense domains, resolving font and script blocking errors.
* Observability: Implemented a persistent, Supabase-backed logging system (`src/lib/logger.ts`) to capture production errors with stack traces.
* Admin Dashboard: Added a new "Error Logs" management page (`/admin/logs`) to review system errors recorded in the database.
* Refactoring: Satisfied React linting rules by decoupling data fetching from JSX construction in dynamic blog pages.
* Observability: Added standardized client and server-side logging for all admin actions (create, update, delete, status change).
* Trust copy (JA): Replaced ambiguous "登録済み" business claims with clearer legal phrasing based on 開業届提出済み status in `about` and `AuthorBio`.
* Contact UX: Added client-side Turnstile token guard with localized error messages (EN/JA/AR) to avoid noisy failed submissions when captcha is not completed.
* Cross-reference: Builds on the CSP and header cleanup from merged branch `fix/changelog-fonts-tests-refactor`.

## [1.10.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.9.0...v1.10.0) (2026-02-24)

### Features

* admin posts management, release workflow fixes, and security updates ([#26](https://github.com/NeoWhisper/neowhisper-blog/issues/26)) ([a411693](https://github.com/NeoWhisper/neowhisper-blog/commit/a4116934522392012d237f69ea214ba3d4dc6dab)), closes [#23](https://github.com/NeoWhisper/neowhisper-blog/issues/23)
* release Supabase Hybrid CMS Phase 1, refactor, and update CI ([#24](https://github.com/NeoWhisper/neowhisper-blog/issues/24)) ([792a2e7](https://github.com/NeoWhisper/neowhisper-blog/commit/792a2e7ad6c867614c4975df793397248c9e8b50)), closes [#23](https://github.com/NeoWhisper/neowhisper-blog/issues/23)

## [1.6.0] - 2026-02-07

### Added

* New marketing homepage with multilingual support (EN/JA/AR).
* Dedicated `/blog` hub page (previous homepage moved and refined).
* Sticky glassmorphism top navigation bar with key anchors.
* `/projects`, `/services`, `/about`, and `/contact` standalone pages.
* Contact form with API endpoint (ready for email provider integration).
* Resend email delivery support for contact form.
* Animated “Visit the Blog” CTA with scroll reveal.
* Planned/locked styling for future projects and platforms.
* Localized About/Services/Projects/Contact pages (EN/JA/AR).
* Contact success page and Turnstile spam protection.
* Multi-recipient email forwarding via `RESEND_TO`.

### Changed

* Sitemap now includes `/projects` and `/services`.

## [1.5.1] - 2026-02-02

### Added

* Playwright E2E tests and configuration (`tests/` and `playwright.config.ts`).
* GitHub Actions workflow to run Playwright E2E on push and PRs (`.github/workflows/e2e.yml`).

### Fixed

* Canonicalized and redirected non-canonical/encoded category slugs to avoid duplicate pages (fixes empty-state for encoded variants).
* Removed `Access-Control-Allow-Origin` header for `/robots.txt` and `/sitemap.xml` (security hardening).
* Added security headers: `Content-Security-Policy`, `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff`.

### Chore

* Updated `README.md` with E2E instructions and `.gitignore` to ignore Playwright artifacts and IDE files.

## [1.5.0] - 2026-01-31

### Added

* **Hreflang Tags**: Added proper hreflang tags to all blog posts for SEO, supporting all language variants (en, ja, ar) with `x-default` pointing to English version
* **Related Posts Section**: Implemented "Related Posts" section below each article showing up to 3 posts from the same category and language, excluding the current post
* **Clickable Category Links**: Made category badges clickable links in both header metadata and footer sections, pointing to category pages with proper URL encoding
* **Language-Aware Language Switcher**: Enhanced language switcher to only display available language variants for each post

### Changed

* **Performance Optimization**: Optimized Core Web Vitals by adding `sizes` prop to hero images to prevent Cumulative Layout Shift (CLS)
* **Font Loading**: Added `display: "swap"` and `preload: true` to font configuration to minimize Flash of Unstyled Text (FOUT)
* **Image Optimization**: Enhanced Next.js image configuration with proper device sizes, image sizes, and cache TTL settings
* **Code Cleanup**: Removed unused UI components (`Badge`, `Button`) and unused CSS variables (sidebar, chart, popover) to reduce bundle size

### Fixed

* **Layout Shift**: Fixed potential layout shift issues by adding proper `sizes` attribute to all `next/image` components

## [1.4.2] - 2026-01-31

### Fixed

* **Sitemap XML Parsing Error**: Fixed XML parsing error (`xmlParseEntityRef: no name`) caused by unescaped `&` characters in category URLs. Category slugs with special characters (like `＆` in Japanese) are now properly URL-encoded using `encodeURIComponent`, ensuring valid XML output.
* **Double Encoding Issue**: Resolved double-encoding problem where category URLs were being encoded twice, resulting in `%25` instead of `%` in the sitemap.

### Changed

* **Sitemap Generation**: Refactored sitemap generation to properly URL-encode category slugs while maintaining consistency with `generateStaticParams` in category pages.
* **Category Slug Consistency**: Standardized category slug generation across sitemap, category pages, and homepage to use the same `createCategorySlug` helper function.

## [1.4.1] - 2026-01-30

### Fixed

* **Hydration Error**: Resolved React hydration mismatch in `LanguageSwitcher` component that was causing "Can't find variable: usePathname" errors
* **Server Errors**: Fixed 500 errors caused by corrupted Turbopack cache
* **Dev Server Conflicts**: Resolved issues with multiple Next.js dev servers running simultaneously

### Changed

* **Code Quality**: Refactored `LanguageSwitcher` to eliminate if statements, using functional patterns with ternary operators and logical operators
* **Error Handling**: Added ESLint disable comments with detailed explanations for legitimate React patterns

## [1.4.0] - 2026-01-29

### Added

* **Multilingual Support**: Added support for 3 language variants per post (English, Japanese, Arabic) with suffix-based routing (`-ja`, `-ar`).
* **Language Switcher**: New glassmorphism `LanguageSwitcher` component to toggle between languages on blog posts.
* **RTL Support**: Full Right-to-Left layout support for Arabic posts, including flipped icons and text alignment.
* **New Content**: Added "TypeScript Best Practices for Full-Stack Apps" in EN, AR, and JA.
* **Dynamic Categories**: Refactored `CategoryNav` to automatically generate categories based on available posts in the current language.
* **Cover Image**: Generated custom cover image for TypeScript post.

### Changed

* **Post Layout Spacing**: Significantly increased vertical spacing for `<h2>`, `<hr>`, and `<ol>` elements within blog posts for better readability.
* **MDX Rendering**: Updated `BlogPostTemplate` to explicitly pass custom components to `MDXRemote`, ensuring consistent styling.

### Fixed

* **Arabic Layout**: Resolved text alignment and direction issues for Arabic content (`dir="rtl"`).
* **Japanese Content Leakage**: Fixed issue where English posts (`desert-geometry.mdx`) were incorrectly tagged as "Art & Design" in Japanese views by standardizing naming conventions.

## [1.3.1] - 2026-01-14

### Added

* Reusable `BlogPostTemplate` component for consistent blog styling
* Automatic reading time calculation using `reading-time` package
* `formatDate` utility function for consistent date formatting
* Keyword research data structure (`keyword-research.ts`, gitignored)
* Content planning dashboard (development-only, gitignored)

### Changed

* Refactored blog post page to use `BlogPostTemplate` (123 lines → 38 lines)
* Blog posts now display reading time, category badges, and hero images
* Updated `.gitignore` to exclude private planning tools
* Updated project to Next.js 16 to sync with `package.json` version
* Refreshed tutorial content and images for Next.js 16

## [1.3.0] - 2026-01-13

### Added

* Google Analytics (GA4) integration with secure environment variable configuration
* Google AdSense setup with conditional loading
* Helper library (`src/lib/gtag.ts`) for type-safe analytics tracking
* Client-side `GoogleAnalytics` component for App Router compatibility
* Environment variable support (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_ADSENSE_ID`, `NEXT_PUBLIC_SITE_URL`)
* TypeScript declarations for gtag API

### Changed

* Updated blog tutorial from Next.js 14 to Next.js 15
* Switched primary font from Geist to Outfit for improved readability
* Enhanced blog post typography with larger headings (H1: 48px, H2: 36px with borders)
* Improved spacing and visual hierarchy in blog content
* Refactored analytics implementation to use dedicated components
* Updated cover image for tutorial post

### Security

* Removed hardcoded API keys and tracking IDs from source code
* Implemented environment variable-based configuration for all sensitive data
* Ensured `.env.local` is properly gitignored

## [1.2.0] - 2026-01-10

### Added

* Professional services showcase on homepage (Software, Games, Translation)
* Trilingual tagline (日本語・English・العربية)
* Business-focused homepage aligned with NEO WHISPER business plan
* Back button on blog post pages
* Styled date badges on blog posts
* Improved blog post page with glassmorphism design
* AdSense component (ready for future activation)
* TODO.md for task tracking
* CHANGELOG.md for version tracking

### Changed

* Consolidated duplicate posts folders (`src/posts` → `src/content/posts`)
* Improved mobile responsiveness on blog post pages
* Enhanced glassmorphism UI throughout site

### Fixed

* Date display styling on blog cards
* Missing navigation between pages
* Post folder organization

## [1.1.0] - 2026-01-10

### Added

* Glassmorphism UI design
* Custom domain neowhisper.net with SSL
* Vercel deployment

## [1.0.0] - 2026-01-08

### Added

* Initial blog setup with Next.js 15
* MDX support for blog posts
* First blog posts (Welcome, Desert Geometry)
