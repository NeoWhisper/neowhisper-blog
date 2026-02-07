<!-- markdownlint-disable MD024 -->
# Changelog

All notable changes to the NeoWhisper blog will be documented here.

## [Unreleased]

- Contact page (coming soon)
- About page (coming soon)
- Code quality: Remove if statements from remaining components

## [1.6.0] - 2026-02-07

### Added

- New marketing homepage with multilingual support (EN/JA/AR).
- Dedicated `/blog` hub page (previous homepage moved and refined).
- Sticky glassmorphism top navigation bar with key anchors.
- `/projects`, `/services`, `/about`, and `/contact` standalone pages.
- Contact form with API endpoint (ready for email provider integration).
- Resend email delivery support for contact form.
- Animated “Visit the Blog” CTA with scroll reveal.
- Planned/locked styling for future projects and platforms.
- Localized About/Services/Projects/Contact pages (EN/JA/AR).
- Contact success page and Turnstile spam protection.
- Multi-recipient email forwarding via `RESEND_TO`.

### Changed

- Sitemap now includes `/projects` and `/services`.

## [1.5.1] - 2026-02-02

### Added

- Playwright E2E tests and configuration (`tests/` and `playwright.config.ts`).
- GitHub Actions workflow to run Playwright E2E on push and PRs (`.github/workflows/e2e.yml`).

### Fixed

- Canonicalized and redirected non-canonical/encoded category slugs to avoid duplicate pages (fixes empty-state for encoded variants).
- Removed `Access-Control-Allow-Origin` header for `/robots.txt` and `/sitemap.xml` (security hardening).
- Added security headers: `Content-Security-Policy`, `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff`.

### Chore

- Updated `README.md` with E2E instructions and `.gitignore` to ignore Playwright artifacts and IDE files.


## [1.5.0] - 2026-01-31

### Added

- **Hreflang Tags**: Added proper hreflang tags to all blog posts for SEO, supporting all language variants (en, ja, ar) with `x-default` pointing to English version
- **Related Posts Section**: Implemented "Related Posts" section below each article showing up to 3 posts from the same category and language, excluding the current post
- **Clickable Category Links**: Made category badges clickable links in both header metadata and footer sections, pointing to category pages with proper URL encoding
- **Language-Aware Language Switcher**: Enhanced language switcher to only display available language variants for each post

### Changed

- **Performance Optimization**: Optimized Core Web Vitals by adding `sizes` prop to hero images to prevent Cumulative Layout Shift (CLS)
- **Font Loading**: Added `display: "swap"` and `preload: true` to font configuration to minimize Flash of Unstyled Text (FOUT)
- **Image Optimization**: Enhanced Next.js image configuration with proper device sizes, image sizes, and cache TTL settings
- **Code Cleanup**: Removed unused UI components (`Badge`, `Button`) and unused CSS variables (sidebar, chart, popover) to reduce bundle size

### Fixed

- **Layout Shift**: Fixed potential layout shift issues by adding proper `sizes` attribute to all `next/image` components

## [1.4.2] - 2026-01-31

### Fixed

- **Sitemap XML Parsing Error**: Fixed XML parsing error (`xmlParseEntityRef: no name`) caused by unescaped `&` characters in category URLs. Category slugs with special characters (like `＆` in Japanese) are now properly URL-encoded using `encodeURIComponent`, ensuring valid XML output.
- **Double Encoding Issue**: Resolved double-encoding problem where category URLs were being encoded twice, resulting in `%25` instead of `%` in the sitemap.

### Changed

- **Sitemap Generation**: Refactored sitemap generation to properly URL-encode category slugs while maintaining consistency with `generateStaticParams` in category pages.
- **Category Slug Consistency**: Standardized category slug generation across sitemap, category pages, and homepage to use the same `createCategorySlug` helper function.

## [1.4.1] - 2026-01-30

### Fixed

- **Hydration Error**: Resolved React hydration mismatch in `LanguageSwitcher` component that was causing "Can't find variable: usePathname" errors
- **Server Errors**: Fixed 500 errors caused by corrupted Turbopack cache
- **Dev Server Conflicts**: Resolved issues with multiple Next.js dev servers running simultaneously

### Changed

- **Code Quality**: Refactored `LanguageSwitcher` to eliminate if statements, using functional patterns with ternary operators and logical operators
- **Error Handling**: Added ESLint disable comments with detailed explanations for legitimate React patterns

## [1.4.0] - 2026-01-29

### Added

- **Multilingual Support**: Added support for 3 language variants per post (English, Japanese, Arabic) with suffix-based routing (`-ja`, `-ar`).
- **Language Switcher**: New glassmorphism `LanguageSwitcher` component to toggle between languages on blog posts.
- **RTL Support**: Full Right-to-Left layout support for Arabic posts, including flipped icons and text alignment.
- **New Content**: Added "TypeScript Best Practices for Full-Stack Apps" in EN, AR, and JA.
- **Dynamic Categories**: Refactored `CategoryNav` to automatically generate categories based on available posts in the current language.
- **Cover Image**: Generated custom cover image for TypeScript post.

### Changed

- **Post Layout Spacing**: Significantly increased vertical spacing for `<h2>`, `<hr>`, and `<ol>` elements within blog posts for better readability.
- **MDX Rendering**: Updated `BlogPostTemplate` to explicitly pass custom components to `MDXRemote`, ensuring consistent styling.

### Fixed

- **Arabic Layout**: Resolved text alignment and direction issues for Arabic content (`dir="rtl"`).
- **Japanese Content Leakage**: Fixed issue where English posts (`desert-geometry.mdx`) were incorrectly tagged as "Art & Design" in Japanese views by standardizing naming conventions.

## [1.3.1] - 2026-01-14

### Added

- Reusable `BlogPostTemplate` component for consistent blog styling
- Automatic reading time calculation using `reading-time` package
- `formatDate` utility function for consistent date formatting
- Keyword research data structure (`keyword-research.ts`, gitignored)
- Content planning dashboard (development-only, gitignored)

### Changed

- Refactored blog post page to use `BlogPostTemplate` (123 lines → 38 lines)
- Blog posts now display reading time, category badges, and hero images
- Updated `.gitignore` to exclude private planning tools
- Updated project to Next.js 16 to sync with `package.json` version
- Refreshed tutorial content and images for Next.js 16

## [1.3.0] - 2026-01-13

### Added

- Google Analytics (GA4) integration with secure environment variable configuration
- Google AdSense setup with conditional loading
- Helper library (`src/lib/gtag.ts`) for type-safe analytics tracking
- Client-side `GoogleAnalytics` component for App Router compatibility
- Environment variable support (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_ADSENSE_ID`, `NEXT_PUBLIC_SITE_URL`)
- TypeScript declarations for gtag API

### Changed

- Updated blog tutorial from Next.js 14 to Next.js 15
- Switched primary font from Geist to Outfit for improved readability
- Enhanced blog post typography with larger headings (H1: 48px, H2: 36px with borders)
- Improved spacing and visual hierarchy in blog content
- Refactored analytics implementation to use dedicated components
- Updated cover image for tutorial post

### Security

- Removed hardcoded API keys and tracking IDs from source code
- Implemented environment variable-based configuration for all sensitive data
- Ensured `.env.local` is properly gitignored

## [1.2.0] - 2026-01-10

### Added

- Professional services showcase on homepage (Software, Games, Translation)
- Trilingual tagline (日本語・English・العربية)
- Business-focused homepage aligned with NEO WHISPER business plan
- Back button on blog post pages
- Styled date badges on blog posts
- Improved blog post page with glassmorphism design
- AdSense component (ready for future activation)
- TODO.md for task tracking
- CHANGELOG.md for version tracking

### Changed

- Consolidated duplicate posts folders (`src/posts` → `src/content/posts`)
- Improved mobile responsiveness on blog post pages
- Enhanced glassmorphism UI throughout site

### Fixed

- Date display styling on blog cards
- Missing navigation between pages
- Post folder organization

## [1.1.0] - 2026-01-10

### Added

- Glassmorphism UI design
- Custom domain neowhisper.net with SSL
- Vercel deployment

## [1.0.0] - 2026-01-08

### Added

- Initial blog setup with Next.js 15
- MDX support for blog posts
- First blog posts (Welcome, Desert Geometry)
