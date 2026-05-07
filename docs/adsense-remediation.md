# AdSense Remediation Notes

Last updated: 2026-05-07

## Diagnosis

The AdSense rejection `有用性の低いコンテンツ` is a content and UX quality issue,
not primarily an OCSP Stapling issue. OCSP Stapling is useful TLS hardening, but
it is not the likely cause of the AdSense rejection.

## Repository Findings

- The content library contains many AI trend brief posts, and many still use the
  shared `/og-image.jpg` cover image.
- Root planning docs and private audit files previously described the site as
  AdSense-ready, but later audit/log evidence shows remediation is still active.
- Local generation logs show repeated model availability/resource failures:
  overloaded Ollama endpoint, LM Studio model load failure, connection timeout,
  and unreachable local endpoint.
- `.logs/`, `AUDIT_REPORTS/`, `TODO.md`, `IMMEDIATE_ACTIONS.md`, and DNS
  checklist files are ignored or local-only; keep PR-ready decisions in tracked
  docs and code.

## Active Policy

- Keep indexable content focused on stronger, human-reviewed articles.
- Noindex AI trend briefs that are short or still use the generic cover image.
- Exclude noindexed brief posts from the sitemap.
- Require new posts to exceed 900 words before commit checks pass.

## Before Reapplying

- Verify `https://www.neowhisper.net/ads.txt` is reachable.
- Verify sitemap excludes low-value brief posts.
- Verify no indexable brief uses `/og-image.jpg`.
- Confirm Privacy, Terms, About, Contact, and Editorial Policy pages are linked
  and localized.
- Re-run lint, unit tests, and build.
