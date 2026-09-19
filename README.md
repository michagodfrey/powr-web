# POWR - Progressive Overload Workout Recorder

Progressive overload is a concept in resistance training where exercise volume (reps × weight) increases over time to keep muscles challenged and growing.

POWR is a web app for recording workout data on major exercises (deadlift, bench press, etc.) and charting volume over time to help track progressive overload.

## Tech Stack

Two-package repo (`client/` + `server/`), not a monorepo tool and not Next.js.

### Frontend (`client/`)

- React 18 + TypeScript, built with Vite
- Tailwind CSS + MUI components
- Chart.js (via `react-chartjs-2`) for graphs
- React Router for navigation
- Installable as a PWA (manifest + service worker)

### Backend (`server/`)

- Express 4 + TypeScript
- Sequelize ORM over PostgreSQL (`pg`)
- Auth: JWT issued by Supabase Auth (Google OAuth or email/password), verified server-side against Supabase's JWKS via `jose`

### Infrastructure

- Vercel hosts both the frontend and the backend API
- Supabase provides the Postgres database and Auth

## Data Model

`User → Exercise → WorkoutSession → Set`

- A `User` owns many `Exercise`s
- An `Exercise` has many `WorkoutSession`s (one per date performed)
- A `WorkoutSession` has many `Set`s (weight, reps, unit)
- Volume = weight × reps, summed per session; kg/lb conversion is handled in `client/src/utils/volumeCalculation.ts`

## Development

```bash
# client
cd client && npm install && npm run dev

# server
cd server && npm install && npm run dev
```

See `server/.env.example` for required environment variables (Supabase database URL, Supabase project URL, CORS origin).

## Inspiration

This project was an idea I've had for a long time and attempted to build a few years ago but didn't finish to a state I was happy with. Here's the [repo](https://github.com/michagodfrey/powr) for that first version, which was based on a spreadsheet I used before that.
