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

## Security Diagnosis Notes

Last reviewed: 2026-06-02

The お名前.com security diagnosis reported an overall grade of `A` and did not
identify urgent security risks. Two informational findings should still be
tracked as hardening items.

### OCSP Stapling

Finding: OCSP Stapling is not enabled.

Risk: If an OCSP response is not obtained during certificate validation, SSL/TLS
communication may proceed without confirming certificate revocation status. OCSP
requests can also disclose browser access patterns to the OCSP responder.

Recommended action:

- If the site is self-hosted, enable OCSP Stapling in the web server
  configuration, for example `SSLUseStapling On` for Apache or
  `ssl_stapling on` for Nginx.
- Configure the OCSP responder URL and certificate validation chain correctly.
- Restart the web server after saving the configuration.
- Verify OCSP Stapling with browser diagnostics and external TLS test tools.
- If the site is hosted on a managed platform such as Vercel, confirm whether
  OCSP Stapling is controlled by the platform or CDN provider rather than this
  repository.

### Public Subdomain

Finding: `www.neowhisper.net` was detected as a related public subdomain.

Risk: Publicly discoverable subdomains can help attackers identify targets for
reconnaissance. Unused or dangling DNS records can also increase subdomain
takeover risk.

Recommended action:

- Confirm that `www.neowhisper.net` is intentional and routes to the expected
  production site.
- Remove or restrict any unintended public subdomains.
- Ensure DNS records do not point to unclaimed hosting resources.
- Use firewall, DNS, or platform access controls for any private subdomains.
- Review access logs regularly for unexpected traffic or abnormal connections.
