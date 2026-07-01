---
name: Feature request
about: Propose a new feature or enhancement
title: "[Feature]: "
labels: ''
assignees: ''
---

## Problem

What user problem does this feature solve? Be specific about who has the problem and how often.

## Proposed solution

A clear and concise description of what you want to happen.

## Alternatives considered

What other approaches did you consider? Why is the proposed solution better?

## Accessibility impact

DescribeAT's primary audience is blind and visually impaired users. How does this feature interact with:

- Screen readers (NVDA, JAWS, VoiceOver, TalkBack)?
- Keyboard-only navigation?
- `prefers-reduced-motion`?
- High-contrast and forced-colour modes?
- Voice control?

If your feature **cannot be made accessible**, please say so explicitly — that is information the maintainers need.

## Data model impact

Does this require changes to:

- [ ] No data model changes
- [ ] Local storage (IndexedDB / Dexie)
- [ ] Server state (TanStack Query cache shape)
- [ ] GraphQL schema (requires coordination with backend ecosystem — see [describeat-backend-ecosystem](https://github.com/ShazaCin/describeat-backend-ecosystem))
- [ ] Service worker / offline cache

If you selected any data-model-impact item, this requires an architectural review before implementation begins. Open the issue for discussion first.

## Dependency impact

Does this require a new runtime dependency?

- [ ] No new dependencies
- [ ] Yes — please name the dependency and justify why an existing solution is not sufficient

New dependencies require Maintainer approval (see [GOVERNANCE.md](../GOVERNANCE.md)).

## Additional context

Add any other context, screenshots, mockups, or links here.