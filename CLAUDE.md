# CLAUDE.md

Guidance for Claude Code (and any AI agent) working in this repo. Supersedes `.cursor/rules/rules.mdc` (left in place for history, no longer authoritative).

## What this is

POWR (Progressive Overload Workout Recorder) tracks resistance-training workouts — exercises, sets, reps, weight — and charts volume (weight × reps) over time to show progressive overload. Feature scope is defined by `docs/PRD/`; treat it as the source of truth before adding anything not already described there. `docs/PRD/planning/mobile-roadmap.md` describes an earlier native-app plan — that plan is **superseded**: the product direction is now a single installable web app (PWA), not React Native / iOS / Android.

## Tech stack

Two-package split repo (not a monorepo tool, no Turborepo/Nx), not Next.js:

- **`client/`** — Vite + React 18 + TypeScript SPA. Tailwind CSS (custom POWR palette: primary orange `#e8772e`, secondary navy `#001f3f`, `darkMode: "class"`), MUI components, Chart.js via `react-chartjs-2` for graphs, `react-router-dom` for routing. Deployed to Vercel.
- **`server/`** — Express 4 + TypeScript API. Sequelize 6 ORM over PostgreSQL (`pg`). Auth is JWT issued by Supabase Auth (Google OAuth or email/password), verified server-side against Supabase's JWKS via `jose`. Deployed to Railway, which also hosts the Postgres database.
- No CI currently runs (`.github/workflows/` doesn't exist), though Jest is configured in both the root `package.json` and `server/`.

## Data model

`User → Exercise → WorkoutSession → Set`:
- A `User` owns many `Exercise`s (e.g. Deadlift, Bench Press).
- An `Exercise` has many `WorkoutSession`s (one per date performed).
- A `WorkoutSession` has many `Set`s (weight, reps, unit).
- Volume = weight × reps, summed per session; unit is kg/lb per-set, with conversion helpers in `client/src/utils/volumeCalculation.ts`. Keep volume math there rather than re-deriving it elsewhere.

## Auth

JWT is the **only** live auth mechanism — Google OAuth (`server/src/config/passport.ts`, `server/src/routes/authRoutes.ts`) and email/password (`authController.ts`). Tokens are verified by `validateJWT` in `server/src/middleware/auth.ts`.

The codebase still carries orphaned express-session scaffolding from a pre-JWT design: `server/src/models/Session.ts`, `express-session`/`connect-pg-simple` in `server/package.json`, and `passport.serializeUser`/`deserializeUser` in `passport.ts`. None of it is wired up (`app.use(session(...))` is absent from `server/src/app.ts`). **Do not extend or build on this session code** — it's dead, and removing it entirely is a valid cleanup, not a regression.

## Platform direction

Web app only, made installable via PWA ("Add to Home Screen") rather than separate native iOS/Android apps — manifest + service worker live in `client/`. Don't introduce React Native, Capacitor, or app-store-specific code.

## Conventions

- Small, single-responsibility components; keep business logic (volume calc, unit conversion, parsing) in `client/src/utils/`, not inline in components.
- Accessible markup — components already use `aria-label` on inputs/buttons (see `WorkoutSet.tsx`); keep that pattern for new interactive elements.
- Light/dark mode support via Tailwind `dark:` variants — every new visible surface needs both.
- Minimize feature creep. If asked for something not covered by `docs/PRD/`, flag that it's outside current scope and confirm before building it, rather than guessing at intent.
- Don't resurrect the session-auth code path or plan native mobile work — both are explicitly out of scope per above.
