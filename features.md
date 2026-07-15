# NeoWhisper Blog - Core Features & Systems

This document outlines the core functionalities, user-facing UI elements, and major architectural systems currently implemented in the NeoWhisper Next.js blog.

## 1. Multilingual Routing & Localization (i18n)
- **Language Support**: English (`en`), Japanese (`ja`), and Arabic (`ar`).
- **Query-Based Routing**: Language context is maintained via URL query parameters (e.g., `?lang=ar` or `?lang=ja`) rather than path-based routing (no `/ar/` sub-directories).
- **RTL Support**: Full Right-to-Left (RTL) layout switching and flex-reversing automatically enabled when the Arabic language is active.
- **Dynamic Dictionaries**: UI strings (labels, buttons, sections) are localized through centralized dictionaries (`src/lib/dictionaries.ts`).
- **Language Switcher**: A global header component (`LanguageSwitcher.tsx`) allowing users to toggle between available languages dynamically.

## 2. Content Management & Static Generation
- **MDX Content**: Blog posts are written in MDX, allowing React components to be seamlessly embedded directly within markdown.
- **Static Site Generation (SSG)**: Pages are pre-rendered at build time for maximum performance and SEO.
- **Admin Dashboard (CMS)**: Supabase-integrated admin panel (`/admin`) for managing posts, logs, and authentication dynamically.
- **Automated Feeds**: Automatically generated `sitemap.xml`, `image-sitemap.xml`, and `rss.xml` for search engine indexing and syndication.

## 3. Core User-Facing UI Elements
- **Article Cards**: Responsive grid cards (`ArticleCard.tsx`) displaying post metadata (category, date, read time) with full-width cover images and cinematic hover glow effects.
- **Sticky Table of Contents**: A dynamically updating Table of Contents (`StickyToc.tsx`) anchored to the right side of the screen that tracks reading progress via Intersection Observer.
- **Scroll Progress Bar**: A fixed gradient bar (`ScrollProgress.tsx`) at the absolute top of the viewport indicating the user's vertical scroll percentage.
- **Dark/Light Mode**: Full theme switching support (`ThemeToggle.tsx`) integrated with `next-themes` and persistent local storage preferences.
- **Image Zoom**: Medium-style clickable image expansion (`ImageZoom.tsx`) for detailed viewing of embedded graphics.
- **Blog Search**: Integrated search modal (`Search.tsx`) for filtering and finding specific articles.
- **Social Sharing**: Sticky side-widget (`ShareSocial.tsx`) for sharing articles to major social platforms.
- **Navigation Utilities**: Breadcrumbs (`Breadcrumbs.tsx`), Post-to-Post navigation (`PostNavigation.tsx`), and a "Back to Top" floating button (`ScrollToTop.tsx`).

## 4. Marketing & Analytics
- **Email Subscription**: Newsletter signup component (`EmailSubscriptionForm.tsx`) located in post footers and sidebars.
- **Contact Inquiries**: A dedicated `/contact` page with a functional `ContactForm.tsx`.
- **Google Analytics**: Integrated tracking code (`GoogleAnalytics.tsx`) for visitor behavior analysis.
- **Monetization**: Google AdSense integration (`AdSenseAd.tsx`) with dedicated slot placements.
- **Cookie Banner**: GDPR/CCPA compliant consent modal (`CookieBanner.tsx`).

## 5. SEO & Performance Enhancements
- **Structured Data (JSON-LD)**: Automated injection of `articleSchema` and `breadcrumbSchema` for enhanced Google Rich Snippets.
- **Cinematic Aesthetics**: Global film grain, vignette overlays, and staggered fade-up animations handled via CSS and Tailwind.
- **Turbopack Optimization**: The Next.js 16 environment utilizes Turbopack for rapid local development compilation.
- **Strict Security**: Implemented nonce-based Content Security Policy (CSP) targeting XSS prevention while maintaining Vercel Analytics and AdSense compatibility.
