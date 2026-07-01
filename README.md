# DescribeAT App

> **Open-source release of the DescribeAT listener-facing Progressive Web App (PWA).**
> DescribeAT is a Shazacin product. This repository is the sanitised, public release.

---

## What is DescribeAT?

DescribeAT is an **audio description (AD) sync app** for blind and visually impaired users. When you are watching a movie or TV show on a separate device (TV, laptop, cinema, streaming box), you tap **sync** in DescribeAT. The app records a few seconds of ambient audio, sends the fingerprint to the matching engine, identifies **what you are watching**, and starts playing the matching **AD audio track at the correct offset** so the description lines up with the visuals.

The listener experience is: tap once, hear the description. The matching, the offset calculation, and the audio playback are invisible to the user. That invisibility is the design goal.

---

## Why this repository?

DescribeAT was built and operated as a closed commercial product by Shazacin. In 2026 Shazacin decided to open-source the application code so the **blind and visually impaired community** — the people who use the app every day — can contribute fixes, improvements, and new features.

This repository is the **sanitised public release** of the listener-facing PWA. It contains the application code, configuration templates, and documentation needed to:

- Build the PWA from source
- Run it locally for development
- Configure it against a self-hosted backend (see [Self-hosting](#self-hosting) below)
- Contribute changes back to the project

The repository does **not** contain:

- Shazacin's production credentials, account IDs, or service endpoints
- The audio description content library (separate licence, not redistributed)
- The closed-source audio fingerprinting engine (see [Tech stack](#tech-stack))
- Any internal tooling, deployment scripts, or operational data

---

## Repo status

This is a **public preview**. The canonical DescribeAT service is operated by Shazacin and is not part of this repository. The code in this repo is a fork of the production app with:

- All hardcoded production values replaced with environment variables
- All AWS / Cognito / AppSync / Firebase identifiers stripped
- Internal URLs removed in favour of placeholders
- Internal tooling and operational scripts removed

The app will not run against a live backend out of the box — you need to point it at your own backend or a self-hosted deployment. See [Self-hosting](#self-hosting).

---

## Quick start

### Prerequisites

- Node.js 20 or later
- npm 10 or later (or pnpm / yarn)
- A DescribeAT backend reachable via HTTPS (your own deployment, or a local mock)

### Install

```bash
git clone https://github.com/ShazaCin/describeat-app-public.git
cd describeat-app-public
npm install
```

### Configure

Copy the example environment file and fill in the placeholders:

```bash
cp .env.example .env.local
```

The placeholders you need to set are documented in `.env.example`. None of the values should point at Shazacin infrastructure.

### Run the dev server

```bash
npm run dev
```

The app is served on `http://localhost:5173` by default.

### Build for production

```bash
npm run build
```

The static build is written to `dist/`. Serve it from any static host (S3 + CloudFront, Netlify, Vercel, GitHub Pages, Nginx, Caddy).

### Run the tests

```bash
npm test
```

---

## Tech stack

- **React 19** — UI framework
- **Vite** — build tool and dev server
- **TypeScript** (strict mode) — language
- **Tailwind CSS** — styling
- **Workbox** — service worker / offline support (PWA)
- **Dexie** — IndexedDB wrapper for offline cache
- **Zustand** — lightweight state management
- **TanStack Query** — server-state cache
- **Framer Motion** — animations (used sparingly — respect `prefers-reduced-motion`)
- **Lucide React** — icon set

### Optional integrations (all configured via environment variables)

- **AWS Amplify** — optional auth / data layer; the app can run without it
- **Firebase Cloud Messaging** — optional push notifications
- **Google Analytics 4** — optional analytics (disabled by default)

### Audio fingerprinting

DescribeAT's sync engine sends a short audio clip to the backend's matching service. The matching algorithm itself is **not** in this repository — the original implementation depends on a closed-source commercial library. The companion [describeat-backend-ecosystem](https://github.com/ShazaCin/describeat-backend-ecosystem) documentation describes the integration points and lists open-source alternatives (e.g. Dejavu) with reduced accuracy.

---

## Self-hosting

This repository contains only the PWA. To run a working DescribeAT deployment you also need:

1. A matching engine (audio fingerprint → title + offset)
2. A catalogue of titles with AD audio tracks
3. Auth and a data layer for user state
4. A CDN for AD audio delivery

See the companion [**describeat-backend-ecosystem**](https://github.com/ShazaCin/describeat-backend-ecosystem) repository for architecture documentation, deployment patterns, and operational guidance.

Point this PWA at your backend by setting the API endpoint environment variables described in `.env.example`. The app expects the same JSON / GraphQL contract documented in the backend repository.

---

## Contributing

We welcome contributions — especially from blind and visually impaired developers who use DescribeAT as their primary screen.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, coding standards, and DCO sign-off requirement. See [GOVERNANCE.md](GOVERNANCE.md) for how decisions are made and how to advance through the contributor ladder.

For accessibility requirements specifically, see [ACCESSIBILITY.md](ACCESSIBILITY.md) (contributions to this document are encouraged — if the access expectations are unclear or incomplete, that's a bug).

---

## Security

Report security vulnerabilities privately to the maintainers — **not** via public issues. See [SECURITY.md](SECURITY.md) for the disclosure process, supported versions, and response timeline.

Note: this repository is a sanitised public preview. The canonical DescribeAT service has its own security reporting channel that is **not** this repository.

---

## Licence

This project is released under the **GNU Affero General Public License v3.0 (AGPLv3)**. See [LICENSE](LICENSE).

The AGPLv3 means: if you deploy a modified DescribeAT as a service accessible to the public, you must publish your modifications. That is the point. Improvements feed back to the community.

Audio description content, the AD audio tracks themselves, and any associated media are **not** covered by the AGPLv3 and are **not** redistributed from this repository. If you self-host, you are responsible for sourcing AD content for your region under whatever licence applies.

---

## Trademark

**DescribeAT™** and the **Shazacin** name are trademarks of Shazacin. Use of these marks in derivative works, including forks and deployments, requires written permission. See [TRADEMARK.md](TRADEMARK.md).

This repository does not contain the DescribeAT or Shazacin logos. Do not add them to forks without permission.

---

## Acknowledgements

DescribeAT was built by the Shazacin team, with original product and engineering work by Shakila and the Sibonga narrator network. This open-source release was prepared by BGC Consultancy in 2026.

The most useful contributors to a project like this are the people who use it every day. Thank you for reading the code, opening issues, sending patches, and teaching us what we got wrong.