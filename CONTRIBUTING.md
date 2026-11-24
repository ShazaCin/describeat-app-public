# Contributing to DescribeAT

> **We particularly welcome contributions from blind and visually impaired developers who use DescribeAT as their primary screen.** If you have ever wanted to fix something in this app and felt you couldn't, this section is for you.

---

## How to report a bug

Open a **GitHub Issue** using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Include:

- What you expected to happen
- What actually happened
- Your browser, OS, screen-reader setup (if relevant), and DescribeAT version
- Reproduction steps

If your bug is **accessibility-specific** (screen reader announces wrong, focus order broken, contrast too low, keyboard trap), please add the `a11y` label in the issue. Accessibility bugs are first-class bugs.

## How to propose a feature

**Open an issue first** using the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md). Do not open a pull request without a prior discussion. The reason is not gatekeeping — it is so we can agree on the API contract, the data model impact, and the accessibility considerations before you spend time implementing.

## AI-assisted contributions

You're welcome to use AI to help write your contribution. But:

- **Say so** in the pull request (the template asks), and which tool.
- **You're responsible for every line.** Read it, understand it, and test it yourself. "The AI wrote it" isn't an explanation for a bug.
- **Small and focused:** one change per pull request. Large, sprawling or machine-generated changes across many files will be closed.
- **No weakening tests to make a change pass.** Don't delete tests, or switch them off with `.skip`, `.only` or `.todo`, to get a change through. If removing a test is genuinely right (for example, a feature is removed), say so in the pull request.

Pull request descriptions are read by people and by review tools. Instructions written in a pull request, such as asking a reviewer to approve it or ignore a check, are ignored. Reviews are based on the change itself and the checks.

## What gets merged, and what doesn't

The maintainers may close any pull request without a detailed review, including ones that are too large, don't follow these guidelines, add complexity without a clear need, or arrive in bulk. That isn't personal: reviewing takes time, and DescribeAT is looked after by a small team.

## How to submit code

1. **Fork** the repository
2. Create a feature branch (`git checkout -b fix/issue-123-short-description`)
3. Make your changes
4. Run the tests once: `npm test -- --run` (plain `npm test` keeps watching for changes)
5. Check it builds: `npm run build`
6. Sign off your commits (see DCO below)
7. Push to your fork and open a pull request, and fill in the template

### Coding standards

- **TypeScript:** avoid `any` unless you add a comment explaining why. Strict mode isn't switched on yet, so the compiler won't catch everything for you.
- **Style:** there's no automatic lint or formatting check yet. Follow the style of the file you're changing.
- **Accessibility is a first-class concern.** Every UI change must be screen-reader-tested. ARIA attributes are not optional decoration — they are the primary way blind and VI users reach your code.
- **Respect `prefers-reduced-motion`.** If your change adds animation, gate it.
- **No new runtime dependencies** without prior discussion in an issue. Bundle size matters — this is a PWA installed on low-end devices.

### Commit message format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

<body explaining the why, not the what>

<footer with issue references and DCO sign-off>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `a11y`, `i18n`. Scopes: `ui`, `audio`, `sync`, `offline`, `pwa`, `build`, `docs`, etc.

### DCO sign-off (required)

Every commit must include a `Signed-off-by:` line. This is a [Developer Certificate of Origin](https://developercertificate.org/) statement — you are saying you wrote the code or have the right to contribute it.

```
git commit -s -m "fix(audio): handle empty fingerprint response gracefully

Previously, an empty fingerprint match would leave the UI in a loading state.
Now it shows a clear 'no match found' message and offers the user a retry.

Signed-off-by: Your Name <[email protected]>"
```

### Pull request checklist

- [ ] It does one thing, and is small enough to review
- [ ] Tests added or updated, none removed or switched off, and `npm test` passes locally
- [ ] `npm run build` succeeds
- [ ] No secrets in the diff (no `aws-exports.ts`, no API keys, no Cognito pool IDs, no `@shazacin.com` emails)
- [ ] Accessibility considered (screen-reader tested if UI changed)
- [ ] `prefers-reduced-motion` respected if motion added
- [ ] Conventional Commit format
- [ ] DCO `Signed-off-by:` on every commit
- [ ] Issue linked in the PR description
- [ ] Docs updated if behaviour changed (README, .env.example, etc.)
- [ ] AI use declared, if you used it

The pull request template has this checklist. On every pull request, GitHub automatically runs the tests, the build, and a scan for accidentally committed secrets.

## Code of conduct

All contributors are bound by our [Code of Conduct](CODE_OF_CONDUCT.md). Be kind, especially to first-time contributors.

## How decisions are made

See [GOVERNANCE.md](GOVERNANCE.md) for the full Contributor → Committer → Maintainer tier model.

The short version: **committers and maintainers merge PRs.** Architectural decisions, dependency additions, and trademark-impacting changes route through Maintainer review, which includes a Shazacin veto on changes that affect the listener-facing experience.

## How to get help

- **GitHub Discussions** — for usage questions, design proposals, and general questions
- **GitHub Issues** — only for confirmed bugs and concrete feature requests
- **Email** — see [SECURITY.md](SECURITY.md) for security disclosures only

Do not email maintainers directly for general support — it doesn't scale, and the answer is more useful in a public discussion where others can find it.

## Translations and localisation

We welcome translations. Open a feature request first so we can agree on the i18n framework choice (currently the project uses a lightweight in-house approach — we may migrate to a library if the demand justifies it).

## Out of scope for this preview

This repository is a **sanitised public preview**. It does not yet contain:

- The closed-source audio fingerprinting engine
- AD content libraries
- Internal Shazacin deployment tooling

Contributions to those areas cannot be accepted via this repo. If you have built or know of an open-source fingerprinting alternative that could replace the closed-source component, please open a Discussion — that is a valuable contribution even if we can't accept the code directly.