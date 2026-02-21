# NeoWhisper Engineering Roadmap (Internal)

**Last Updated:** February 21, 2026  
**Current Version:** v1.9.0  
**Purpose:** Internal planning for engineering, infrastructure, AI-assisted workflows, and experiments.

---

## Recently Completed (Timeline)

| Date | Version | What Was Completed |
| --- | --- | --- |
| 2026-02-21 | v1.9.0 | Admin Dashboard refactor: dynamic hydration from URL parameters, functional state initialization, and fixed TypeScript expression errors. |
| 2026-02-16 | v1.8.x-v1.8.2 | Business identity update; SEO and AdSense asset fixes; removed empty CORS headers from `robots.txt` and `sitemap.xml`. |
| 2026-02-10 | v1.6.1 | Security hardening release: XSS fix and Next.js upgraded to `16.1.5`. |
| 2026-02-09 | v1.6.0 | Contact pipeline maturity (Turnstile + Resend), AdSense/CSP readiness, and major multilingual marketing foundation work. |
| 2026-02-02 | v1.5.1 | Playwright E2E testing introduced plus security headers and crawler endpoint hardening. |
| 2026-01-29 to 2026-01-31 | v1.4.0-v1.5.0 | Multilingual blog architecture, hreflang/SEO upgrades, related-post system, and sitemap/category reliability fixes. |
| 2026-01-13 to 2026-01-14 | v1.3.0-v1.3.1 | Analytics/AdSense foundation, reusable blog template, reading-time, and internal content-planning tooling. |

## Current Baseline

- Trilingual site foundation (EN/JA/AR) for marketing, services, projects, blog, and legal pages.
- Contact pipeline in production shape (`/api/contact`) with Turnstile + Resend integration.
- Security posture in place: CSP, security headers, and scheduled production security scan workflow.
- Test coverage includes Playwright E2E checks for key routing/security/hydration paths.
- SEO baseline in place: sitemap, robots, metadata coverage, and structured data for content pages.

---

## Active Sprint (0-30 days)

### Content Operations

- [ ] Add MDX quality checks (frontmatter completeness, date format, language parity hints).
- [ ] Define a stricter editorial QA checklist for EN/JA/AR consistency.
- [ ] Normalize category naming and taxonomy mapping across all languages.

### Conversion and Trust

- [ ] Expand client-facing case studies with measurable outcomes.
- [ ] Tighten service package clarity (scope, deliverables, and expected timelines).
- [ ] Improve public trust signals while keeping personal data exposure minimal.

### SEO and Discoverability

- [ ] Evaluate migration plan for cleaner language routes (`/[lang]/...`).
- [ ] Add internal linking standards per article type.
- [ ] Review schema completeness for service and project pages.

---

## Near-Term (31-90 days)

### AI and Automation Track

- [ ] Build internal AI-assisted translation QA workflow (terminology consistency and style checks).
- [ ] Create AI-assisted metadata draft workflow with mandatory human approval.
- [ ] Build a lightweight internal prompt library for article outlines, localization review, and release notes.

### Infrastructure and Reliability

- [ ] Add structured error/event logging for contact submission flow.
- [ ] Add rate-limit and anti-spam observability for contact endpoint.
- [ ] Add synthetic health checks for critical public paths.
- [ ] Define dependency and security update cadence with ownership.

### Developer Experience

- [ ] Add scripts for repo health checks (content lint + link checks + metadata sanity).
- [ ] Reduce repetitive copy/translations via shared dictionaries where practical.
- [ ] Improve CI feedback ergonomics (clear failing summaries and remediation hints).

---

## Experiment Backlog

- [ ] Interactive technical demos embedded in selected blog posts.
- [ ] Lightweight downloadable tooling/resources for lead generation.
- [ ] Small game prototype landing flow connected to projects and contact funnel.
- [ ] A/B test multilingual CTA variants for service inquiries.

---

## Explicitly Deferred

- Native mobile app products (outside current service-focused execution).
- Public comments system on blog (moderation overhead not justified now).
- PWA packaging and offline mode (low priority versus core service delivery).

---

## Internal Notes

- This document is for internal execution planning, not customer-facing marketing copy.
- Keep legal/business identity aligned with registered scope: IT services business.
- For public-facing messaging, use the `/roadmap` page and marketing pages instead.
