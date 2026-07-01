## What this PR does

<!-- One paragraph describing the change. -->

## Linked issue

<!-- Link to the issue this PR addresses, or "Fixes #123" if it closes an issue. -->

## Type of change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Accessibility improvement
- [ ] Refactor (no observable behaviour change)
- [ ] Test addition / update

## Checklist

- [ ] Tests added or updated (and pass locally: `npm test`)
- [ ] Linter clean (`npm run lint`)
- [ ] Type check clean (`tsc --noEmit`)
- [ ] **No secrets in the diff** — no `aws-exports.ts` content, no API keys, no Cognito pool IDs, no AppSync endpoints, no `@shazacin.com` emails, no Firebase config. See [CONTRIBUTING.md](../CONTRIBUTING.md) for what counts as a secret.
- [ ] **Accessibility considered** — screen-reader tested if UI changed, focus order checked, ARIA attributes where needed
- [ ] **`prefers-reduced-motion` respected** if motion added or changed
- [ ] Conventional Commit format on every commit
- [ ] DCO `Signed-off-by:` on every commit
- [ ] Docs updated if behaviour changed (README, .env.example, this PR template's data-model section, etc.)

## Data model impact

- [ ] No data model changes
- [ ] Local storage only (IndexedDB / Dexie)
- [ ] Server state (TanStack Query cache shape) — backwards compatible
- [ ] GraphQL schema change — coordinated with [describeat-backend-ecosystem](https://github.com/ShazaCin/describeat-backend-ecosystem)

## Screenshots / recordings

If this is a UI change, attach before/after screenshots. **For accessibility changes, attach a screen-reader transcript or recording instead — visual screenshots cannot demonstrate screen-reader behaviour.**

## Additional notes

Anything else reviewers should know.