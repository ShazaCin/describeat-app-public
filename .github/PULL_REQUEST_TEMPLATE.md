## What this changes

<!-- In plain words: what does it do, and for whom? One change per pull request. -->

## Why

<!-- Link the issue this comes from (for example "Closes #12"). Please agree the
idea in an issue first, before writing code. Bug fixes with a clear explanation
are always welcome. -->

## How you checked it

<!-- What did you do to make sure it works? For example: the steps you followed
in the app, the screen reader and browser you used, or the tests you added. -->

## Checklist

- [ ] It does one thing, and is small enough to review.
- [ ] It has tests for what it changes, and no tests were removed or switched off (no `.skip`, `.only` or `.todo`).
- [ ] I ran `npm test` and everything passes.
- [ ] I ran `npm run build` and it builds.
- [ ] It works with a screen reader and a keyboard, if it changes anything people see or hear.
- [ ] It respects `prefers-reduced-motion`, if it adds or changes movement.
- [ ] **No secrets in the diff**: no `aws-exports.ts` content, no API keys, no Cognito pool IDs, no AppSync endpoints, no `@shazacin.com` email addresses, no Firebase config. See [CONTRIBUTING.md](../CONTRIBUTING.md).
- [ ] Every commit is signed off (`git commit -s`), and uses the Conventional Commit format.
- [ ] Docs are updated if behaviour changed (README, `.env.example`, and so on).

## Data model impact

- [ ] No data model changes
- [ ] Local storage only (IndexedDB / Dexie)
- [ ] Server state (TanStack Query cache shape), backwards compatible
- [ ] GraphQL schema change, coordinated with [describeat-backend-ecosystem](https://github.com/ShazaCin/describeat-backend-ecosystem)

## AI

- [ ] I used AI to write or change this.

<!-- If you did: which tool, and what you checked yourself. AI-assisted pull
requests are welcome, but you're responsible for every line. -->

## Screenshots or recordings

<!-- For a visual change, before and after screenshots. For an accessibility
change, a screen-reader transcript or recording instead, because screenshots
can't show what a screen reader says. -->
