# Changelog

All notable changes to the NeoWhisper blog will be documented here.

## [Unreleased]

- Services page (coming soon)
- Contact page (coming soon)
- About page (coming soon)

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
