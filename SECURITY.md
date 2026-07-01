# Security

> **This repository is a sanitised public preview.** It does not operate a live service. The canonical DescribeAT service is operated by Shazacin and is not part of this repository. This document covers how to report security issues **in the code in this repository**, not in the production service.

---

## Supported versions

Only the **latest commit on `main`** receives security updates. Older commits are not patched. This is appropriate for a sanitised public preview that has not yet reached a tagged release. Once we cut a `v1.0.0` release, this policy will update to support the latest release plus the previous release for a grace period.

## Reporting a vulnerability

**Do not file a public issue.** Public disclosure before a fix is available gives attackers a head start.

Instead, report privately using **GitHub's private vulnerability reporting** feature:

1. Go to <https://github.com/ShazaCin/describeat-app-public/security/advisories/new>
2. Fill in the advisory form with reproduction steps, impact, and affected versions
3. Submit

Or, if you cannot use GitHub's advisory form, email the maintainers at the address listed in the [GOVERNANCE.md](GOVERNANCE.md) document under "Conduct reports" — that channel is monitored by project maintainers.

**Please do not report security issues via GitHub Discussions, regular GitHub Issues, or any other public channel.**

## What to expect

| Stage | Target timeline |
|---|---|
| Acknowledgement of your report | 5 business days |
| Triage decision (accepted / declined / needs more info) | 10 business days from acknowledgement |
| Patch for **critical** issues (RCE, auth bypass, data exfiltration of user data) | 14 days from triage acceptance |
| Patch for **high** severity issues (XSS stored, CSRF on auth, broad information disclosure) | 30 days from triage acceptance |
| Patch for **medium / low** severity issues | Best effort, included in the next regular release |
| Public disclosure after patch is available | 90 days from report, coordinated with you |

Timelines are targets, not guarantees. If we need more time we will tell you before the target expires.

## What we will not do

- We will not threaten or pursue legal action against you for reporting a vulnerability in good faith
- We will not require you to sign an NDA as a precondition for reporting (we may ask for one if we need to share pre-patch details beyond what is needed to reproduce)
- We will not publish your name without your consent (unless you prefer public credit)

## Scope of this security policy

**In scope:**
- The DescribeAT PWA application code in this repository
- The build configuration (Vite config, TypeScript config, ESLint config, Prettier config)
- The example environment variables and deployment templates
- Documentation that could lead to a misconfiguration resulting in a vulnerability

**Out of scope:**
- The production DescribeAT service operated by Shazacin (separate disclosure channel — not this repo)
- The closed-source audio fingerprinting engine (different vendor)
- The DescribeAT backend infrastructure (see the [describeat-backend-ecosystem](https://github.com/ShazaCin/describeat-backend-ecosystem) repo)
- Self-hosted deployments operated by third parties (you are responsible for your own infrastructure)

## Security considerations for self-hosters

If you self-host DescribeAT, the following items are **your responsibility**, not the project's:

- Securing your HTTPS endpoint (TLS configuration, HSTS, certificate renewal)
- Setting strong values for the environment variables in `.env` — never use the placeholder defaults in production
- Configuring your authentication provider with appropriate policies (MFA, session timeouts, password complexity)
- Hardening your CDN (cache invalidation, signed URLs, origin access identity)
- Monitoring for unusual activity and keeping dependencies up to date

The AGPLv3 licence requires that modifications you deploy as a service be published. That is a feature, not a vulnerability — but it does mean that if you self-host, your modifications will be visible.

## Acknowledgements

We thank the security researchers and community members who report issues responsibly. Reporters who wish to be credited will be listed in the patch release notes (with their permission).

## Contact

- **Private vulnerability report:** <https://github.com/ShazaCin/describeat-app-public/security/advisories/new>
- **Conduct reports** (Code of Conduct violations, not security issues): see GOVERNANCE.md
- **General questions:** GitHub Discussions (public, do not use for security issues)

---

*Last reviewed: 2026*