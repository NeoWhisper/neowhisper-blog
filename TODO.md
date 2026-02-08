# NeoWhisper Blog - TODO

## 🔥 Focus Now (AdSense Approval Sprint)

- [ ] Publish 3 more long-form posts (EN) (800–1500+ words each, original screenshots/diagrams if possible)
- [ ] Add JP/AR versions (or at least localized summaries) for cornerstone posts to avoid “thin/duplicated” signals
- [ ] Add internal linking on every post (to related posts + Services/Projects/Contact)
- [ ] Check production with ad blockers OFF: no CSP blocks for required AdSense/GA scripts
- [ ] Submit `sitemap.xml` in Google Search Console and re-request AdSense review after updates propagate (24–72h)

## 🧰 Quality Checklist (AdSense / SEO / Trust)

- [ ] Footer has working links: Privacy / Terms / Contact (and keeps `?lang=` when navigating)
- [ ] No “soft 404” pages returning 200 in production (use real `notFound()` for internal/dev-only routes)
- [ ] No empty category pages in `sitemap.xml` (only categories that actually have posts)
- [ ] Social previews work (set `metadataBase`, cover image exists for every post)
- [ ] Contact form works end-to-end (Turnstile ok, Resend delivery ok, clear error messages)

## 🚀 In Progress

- [ ] Remove if statements from entire codebase (functional programming refactor)
  - [x] LanguageSwitcher.tsx
  - [ ] ArticleCard.tsx
  - [ ] CategoryNav.tsx
  - [ ] BlogPostTemplate.tsx
  - [ ] Page components
- [ ] Write 15-20 SEO-focused blog posts (based on keyword research)
- [ ] Populate Projects page with real case studies and screenshots
- [ ] Add real download links for apps/music (App Store, Google Play, Spotify, etc.)

## 📋 Next Up

- [ ] Submit sitemap to Google Search Console (after v1.5.0 deployment)
- [ ] Monitor Core Web Vitals and page speed (optimizations completed)
- [ ] Validate structured data with Rich Results Test
- [ ] Test hreflang tags in Google Search Console

- [ ] Write second blog post: "AI-Powered Code Generation Tools"
- [ ] Verify Resend domain and configure `RESEND_FROM`
- [ ] Add Turnstile keys in Vercel (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`)
- [ ] Configure `RESEND_TO` with comma-separated recipients if needed
- [ ] Apply for Google AdSense (after 6 months)

## 🌐 Future: Multi-language Support

- [ ] Upgrade to Next.js i18n routing ([lang]/blog/[slug]) for cleaner URLs
- [ ] Create translation files (en.json, ja.json, ar.json) for UI elements
- [ ] Set up automatic language detection based on user location
- [ ] Organize posts by language (content/posts/en, ja, ar)

## 🐛 Fixes (Recently Found)

- [x] Fix JP/AR category pages showing 0 articles due to non-canonical slugs
- [x] Deduplicate category counts (don’t show EN/JA/AR as 3 separate posts in category pages)
- [x] Stabilize language tabs under RTL so the pill order doesn’t flip
- [ ] Replace the AdSense playbook cover image with a NeoWhisper-branded cover

## ✅ Completed (2026-01-31)

- [x] **Add hreflang tags for SEO** - Implemented proper hreflang tags for all blog posts with language variants
- [x] **Add Related Posts section** - Shows 3 related posts from same category and language
- [x] **Make category badges clickable** - Added clickable category links in header and footer
- [x] **Performance optimization** - Optimized images, fonts, and removed unused code for Core Web Vitals
- [x] **Remove unused components** - Deleted unused Badge and Button UI components
- [x] **Clean up unused CSS** - Removed sidebar, chart, and popover CSS variables

## ✅ Completed (2026-01-30)

- [x] Fix React hydration mismatch in LanguageSwitcher component
- [x] Resolve "Can't find variable: usePathname" error  
- [x] Debug and fix 500 server errors (corrupted Turbopack cache)
- [x] Refactor LanguageSwitcher to eliminate if statements
- [x] Clear multiple conflicting dev servers
- [x] Add ESLint disable comments with explanations for legitimate patterns
- [x] **Optimize homepage for SEO**
  - [x] Add comprehensive metadata (title, description, Open Graph, Twitter Card)
  - [x] Implement JSON-LD structured data (WebSite + Organization schemas)
  - [x] Create dynamic XML sitemap with all blog posts and categories
  - [x] Configure robots.txt
  - [x] Hardened CORS for robots/sitemap (removed Access-Control-Allow-Origin)
  - [x] Generate professional OG image for social sharing
- [x] Deploy v1.4.1 to production

## ✅ Completed (2026-01-29)

- [x] Write third blog post: "TypeScript Best Practices for Full-Stack Apps" (EN, AR, JA)
- [x] Add Language Switcher component to blog posts
- [x] Configure Arabic RTL support (automatic detection via slug)
- [x] Implement suffix-based multilingual routing logic
- [x] Refactor Category Navigation to be fully dynamic based on visible posts
- [x] Increase blog post vertical spacing (H2, HR, OL) for better legibility
- [x] Fix Japanese category leakage by renaming `desert-geometry.mdx` to standard `-ja` suffix

## ✅ Completed (2026-01-14)

- [x] Write first blog post: "Next.js 16 Server Components Tutorial"
- [x] Create reusable BlogPostTemplate component
- [x] Add automatic reading time calculation
- [x] Conduct keyword research for top 10 blog topics
- [x] Create content planning dashboard (dev-only)
- [x] Secure private planning tools with .gitignore

## ✅ Completed (2026-01-13)

- [x] Implement Google Analytics (GA4) with environment variables
- [x] Set up Google AdSense infrastructure (conditional loading)
- [x] Update blog tutorial to Next.js 15
- [x] Switch to Outfit font for better readability
- [x] Enhance blog typography (larger headings, better spacing)
- [x] Add syntax highlighting for code blocks
- [x] Secure all API keys with environment variables
- [x] Create gtag helper library for analytics

## ✅ Completed (2026-01-10)

- [x] Set up Next.js 15 blog
- [x] Deploy to Vercel with auto-deploy
- [x] Connect custom domain (neowhisper.net)
- [x] Configure SSL certificate
- [x] Consolidate posts folders
- [x] Add glassmorphism UI
- [x] Update tagline to professional trilingual message
- [x] Add services showcase on homepage
- [x] Add back button to blog posts
- [x] Style date badges properly
- [x] Create AdSense component structure
- [x] Add TODO.md and CHANGELOG.md
- [x] Move welcome.mdx to correct folder
- [x] Delete duplicate src/posts folder

## ✅ Completed (2026-02-07)

- [x] Create Services page with detailed offerings
- [x] Create Projects page (initial scaffold)
- [x] Add sticky top navigation bar
- [x] Split marketing homepage (/) and blog hub (/blog)
- [x] Add About page
- [x] Add Contact page with form
- [x] Add multilingual homepage (EN/JA/AR)
