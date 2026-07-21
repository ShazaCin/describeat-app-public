# DescribeAT

> **Open-source audio description sync app for blind and visually impaired viewers.**
> Tap sync, let your phone listen to what's on TV, and hear a synchronised audio description track.

---

## What is DescribeAT?

DescribeAT is a Progressive Web App (PWA) that lets blind and visually impaired people watch any movie or TV show with audio description (AD). Instead of searching for a title in a platform-specific app, the user simply:

1. Opens DescribeAT on their phone
2. Taps **Sync** — the app records ~10 seconds of ambient audio from the TV
3. The backend identifies the show and calculates the playback offset
4. The audio description track plays in sync with what's on screen

No app store installation required. It runs in any modern mobile browser.

## Why open source?

Audio description should not be a walled garden. No single company can describe every film, in every language, for every market. By open-sourcing DescribeAT, we invite the global community — developers, accessibility advocates, AD narrators, and blind users themselves — to improve the app, expand the catalogue, and bring audio description to more people.

The code is released under **AGPLv3 with DCO**. This means:

- Anyone can use, study, and modify the code
- If you deploy a modified version as a service, you must share your improvements publicly
- Contributors sign off with a simple `git commit -s` — no CLA paperwork
- Audio description tracks, fingerprint data, and reference audio are covered by a separate `LICENSE.media` file

## Tech stack

- **React 19** + **Vite 6** + **TailwindCSS 4**
- **AWS Amplify** (Cognito auth, AppSync GraphQL, S3 storage)
- **Firebase Cloud Messaging** for push notifications
- **Service Worker** for offline resilience
- Accessibility-first design (VoiceOver, TalkBack, NVDA compatible)

## Getting started

### Prerequisites

- Node.js 20+
- An AWS account (for Cognito, AppSync, S3) — or a compatible backend
- A Firebase project (for push notifications)

### Installation

```bash
# Clone the repo
git clone https://github.com/ShazaCin/describeat-app-public.git
cd describeat-app-public

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env.local

# Fill in your own values (see .env.example for what each variable does)
# You'll need: Cognito pool IDs, AppSync endpoint, Firebase config

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment variables

See [`.env.example`](.env.example) for the full list. Key variables:

| Variable | What it does |
|----------|-------------|
| `VITE_COGNITO_USER_POOL_ID` | Your Cognito user pool for listener auth |
| `VITE_APPSYNC_ENDPOINT` | Your AppSync GraphQL endpoint |
| `VITE_FIREBASE_API_KEY` | Firebase project API key for push notifications |

For backend setup (Cognito, AppSync, S3, the T2S fingerprinting engine), see the [DescribeAT Backend & Ecosystem](https://gitlab.com/shazacin/describeat-backend-ecosystem) documentation.

## Project structure

```
describeat-app-public/
├── src/
│   ├── components/       # UI components
│   ├── graphql/           # GraphQL queries and mutations
│   ├── services/          # Firebase messaging, API calls
│   ├── stores/            # State management
│   └── sw.ts              # Service worker for offline support
├── public/                # Static assets, PWA icons
├── .env.example           # Environment variable template
├── aws-exports.example.ts # AWS Amplify config template
└── config/firebase.ts     # Firebase config (reads from env vars)
```

## Contributing

We welcome contributions from everyone — especially blind and visually impaired developers, AD writers, translators, and testers. Non-code contributions are first-class.

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup and PR workflow
- Read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community standards
- Check for `good first issue` labels for beginner-friendly tasks
- Sign off your commits with `git commit -s` (DCO)

All contributions must pass automated accessibility checks (axe-core, jest-axe) and maintain WCAG 2.1 AA as a minimum standard.

## Security

Found a vulnerability? Please report it privately — see [SECURITY.md](SECURITY.md) for the process. Do not open a public issue for security matters.

## License

This project is licensed under **AGPLv3** — see [LICENSE](LICENSE) for the full text. Audio description tracks and media content are covered separately under [LICENSE.media](LICENSE.media).

## Related repositories

- [DescribeAT Admin Portal](https://github.com/ShazaCin/describeat-admin-public) — the staff-facing console for managing the catalogue
- [DescribeAT Backend & Ecosystem](https://gitlab.com/shazacin/describeat-backend-ecosystem) — backend documentation, deployment guides, and architecture reference

---

*DescribeAT is a [Shazacin Accessible Media](https://shazacin.com) project. Built with the community.*