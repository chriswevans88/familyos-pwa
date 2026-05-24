# FamilyOS

FamilyOS is a premium, mobile-first household command center PWA. It combines cashflow, budgets, recurring bills, family tasks, shared goals, and a locally generated weekly family briefing into one installable app.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- Recharts
- date-fns
- vite-plugin-pwa
- localStorage persistence

## Local Development

```bash
npm install
npm run icons
npm run dev
```

Open `http://localhost:5173`.

Production checks:

```bash
npm run lint
npm run typecheck
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Vercel Deployment

1. Push this repository to GitHub.
2. Create a new Vercel project from the repo.
3. Use these exact Vercel settings:
   - Framework: `Vite`
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy.

The app is frontend-only. It does not need backend services, environment variables, API keys, auth, databases, or bank integrations.

## PWA Install

FamilyOS includes a web app manifest, generated PNG icons, Apple touch icon, mobile meta tags, and service worker support through `vite-plugin-pwa`.

On iPhone:

1. Open the deployed site in Safari.
2. Tap Share.
3. Choose Add to Home Screen.
4. Launch FamilyOS from the Home Screen.

On Android or desktop Chrome:

1. Open the site.
2. Use the browser Install prompt or install icon.
3. Launch FamilyOS as a standalone app.

## Demo Script

1. Open FamilyOS and tap “Skip with demo household.”
2. On Home, show the command-center hero, Household Health Score, Tonight’s Win, family avatars, budget room, and Sunday report.
3. Tap Money, add a small expense, refresh the app, and show the transaction persists.
4. Tap Bills to show due-soon status, autopay/manual ownership, and recurring obligations.
5. Tap Tasks, complete a responsibility, and show momentum/streak behavior.
6. Tap Goals, add a contribution, and show goal progress update instantly.
7. Tap Brief, regenerate the operating report, then copy or export it.
8. Tap Settings to show phone install steps, JSON backup/import, and reset demo data.

## Data Model

The app stores typed local data for:

- Household and family members
- Transactions and budgets
- Recurring bills
- Tasks and responsibilities
- Goals
- Weekly briefing snapshots

All user changes persist in `localStorage` under `familyos:data:v1`.
