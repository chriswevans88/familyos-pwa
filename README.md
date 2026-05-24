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
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Vercel Deployment

1. Push this repository to GitHub.
2. Create a new Vercel project from the repo.
3. Use the default Vite settings:
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

## Demo Script For A Phone

1. Open FamilyOS and tap “Skip with demo household.”
2. Pause on the dashboard: show the household health score, cashflow cards, today queue, goals, and Sunday Briefing.
3. Tap Money: add a small expense, then refresh to show localStorage persistence.
4. Tap Bills: point out due-soon highlighting and autopay/manual ownership.
5. Tap Tasks: complete one task and show the streak/momentum change.
6. Tap Goals: add a contribution to a goal and show progress update.
7. Tap Brief: regenerate the executive-style weekly briefing, then copy or export it.
8. Tap Settings: show install help, theme choices, JSON export/import, and reset demo data.

## Data Model

The app stores typed local data for:

- Household and family members
- Transactions and budgets
- Recurring bills
- Tasks and responsibilities
- Goals
- Weekly briefing snapshots

All user changes persist in `localStorage` under `familyos:data:v1`.
