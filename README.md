# Brava · Frontend

Brava is a full-stack application for a women's strength-training gym, built as a team bootcamp project. Members can book classes, follow their routines and manage purchases, while trainers and administrators have dedicated workspaces.

This repository contains the React application. It connects to the [Brava backend](https://github.com/T4-P2-BravaGym/BravaGym-backend/tree/dev), which provides the API and database. The application interface is in Spanish.

## Features

- Public class schedule, trainer profiles, membership pricing and shop.
- Registration, login, password recovery and automatic session renewal.
- Member bookings, personal training, routines, cart and payment history.
- Trainer class management, routines and profile photos.
- Administration of users, plans, products, discounts, payments and cancellation requests.

The integrated demo uses simulated payments. Password-recovery links are available in the backend's private local `outbox/`, rather than delivered by email.

## Tech stack

| Technology | Version in package-lock.json |
| --- | --- |
| React / React DOM | 19.3.0 |
| React Router | 7.18.4 |
| Vite | 8.3.4 |
| Sass (CSS Modules) | 1.105.1 |
| Vitest | 5.0.5 |

The application uses JavaScript. Tests use Testing Library and jsdom. [package.json](package.json) defines the dependency ranges; [package-lock.json](package-lock.json) records the installed versions.

## Run locally

Requirements: Git, Node.js **22.12 or later in the 22.x release line**, npm, and the running backend. CI uses Node 22.

1. Set up and start the API using the [backend README](https://github.com/T4-P2-BravaGym/BravaGym-backend/blob/dev/README.md), including migrations and demo data.
2. In a separate terminal, install and start the frontend:

```bash
git clone --branch dev https://github.com/T4-P2-BravaGym/BravaGym-frontend.git
cd BravaGym-frontend
npm ci
cp .env.example .env
npm run dev
```

Keep these values in the frontend `.env`:

```dotenv
VITE_API_URL=http://localhost:8000/api/v1
VITE_DEV_SKIP_AUTH=false
```

Open [http://localhost:5173](http://localhost:5173). Keep both servers running and use `localhost` for both. The backend must allow `CORS_ORIGINS=["http://localhost:5173"]`. Restart Vite after changing `.env`; frontend `VITE_*` variables are public and must not contain secrets.

## Usage

Browse **Clases**, **Entrenadoras**, **Precios** and **Tienda**, or open [Entrar](http://localhost:5173/entrar) to try a demo account. All accounts below use `BravaDemo2026!`, unless the backend seed used a different `SEED_PASSWORD`.

| Role | Demo email | Starting page |
| --- | --- | --- |
| Member | `lucia@example.com` | `/mi-area` |
| Trainer | `ana@example.com` | `/entrenadora/clases` |
| Administrator | `admin@example.com` | `/admin` |
| Superadministrator | `superadmin@example.com` | `/admin` |

For a quick tour, sign in as a member to browse bookings, routines and the cart. Sign out, then use the administrator account to manage plans and products. The demo accounts require the backend seed data.

If you see a server connection error, check that [API health](http://localhost:8000/health) responds, then check `VITE_API_URL` and the backend's CORS setting.

## Project structure

```text
src/
  components/     # Shared UI, gym components and navigation
  context/        # Session and cart state
  hooks/          # Reusable React hooks
  layouts/        # Public and private page layouts
  pages/          # Public, member, trainer and admin screens
  routes/         # Paths, navigation and access guards
  services/       # API requests and session handling
  styles/         # Design tokens, mixins and global styles
  test/           # Shared test setup
  utils/          # Formatting and other helpers
public/           # Static assets
specs/            # Frontend feature specifications
```

## Checks and build

```bash
npm test                 # Run Vitest once
npm run lint             # Check JavaScript
npm run build            # Create dist/
```

Use `npm run test:watch` while developing. To preview a build, run `npm run preview` and open the URL it prints (normally `http://localhost:4173`). The API is still required; add that preview origin to the backend's `CORS_ORIGINS` and restart the API first.

## Documentation

- [Backend setup and API documentation](https://github.com/T4-P2-BravaGym/BravaGym-backend/blob/dev/README.md).
- [Route definitions](src/routes/paths.js) and [frontend specifications](specs/).
- [Session contract](https://github.com/T4-P2-BravaGym/BravaGym-backend/blob/dev/specs/HU-33-refresh-logout.md), [password recovery](https://github.com/T4-P2-BravaGym/BravaGym-backend/blob/dev/specs/HU-35-password-reset.md) and [shared AI-use log](https://github.com/T4-P2-BravaGym/BravaGym-backend/blob/dev/docs/ai-log.md).

## Authors and support

Built by the Brava team: Beste Özaydın, Damaris Castro, Esra Kesken, Mariana and Viviana Andrango. See the [contributors](https://github.com/T4-P2-BravaGym/BravaGym-frontend/graphs/contributors).

Report bugs or ask questions through [GitHub Issues](https://github.com/T4-P2-BravaGym/BravaGym-frontend/issues).
