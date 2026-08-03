# Task Timer & Productivity Analytics System

A server-driven task timer and productivity tracker themed like *Solo Leveling*: time spent on tasks levels up per-skill XP bars (Frontend, Backend, DSA, Design, etc.), classified automatically by an AI layer from your task history. Timer state lives on the backend as timestamps, so closing the browser or sleeping your laptop never loses tracked time.

## Key features

- **Server-driven stateless timer** — `started_at`/`ended_at` timestamps, not client-side ticking state.
- **Recursive tasks & subtasks** — break large goals into nested subtasks.
- **Solo Leveling-style skill XP** — an AI layer classifies completed tasks by skill and attributes time as XP, retroactively across your whole task history.
- **AI focus validation** *(planned)* — a local agent polls the active window/tab every 60s and flags distraction blocks against the running task.
- **Sketch/hand-drawn UI** — rough.js-style sketchy borders and components throughout.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js (App Router), Tailwind CSS, shadcn/ui, TanStack Query |
| Backend | Fastify 5 + TypeScript |
| Database | PostgreSQL via Prisma |
| Auth | JWT (`@fastify/jwt`), scrypt password hashing |

## Structure

```
src/
  backend/    Fastify + Prisma API (routes -> controllers -> services -> repositories)
  frontend/   Next.js app (services -> hooks -> components)
```

See `src/backend/CLAUDE.md` and `src/frontend/CLAUDE.md` for detailed architecture notes.

## Getting started

### Backend (`src/backend`)

```bash
cp .env.example .env   # set DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, PORT, HOST, CORS_ORIGIN
npm install
npm run prisma:migrate
npm run dev             # http://localhost:<PORT>
```

### Frontend (`src/frontend`)

```bash
pnpm install             # repo uses pnpm (pnpm-lock.yaml)
pnpm dev                 # http://localhost:3000
```

Requires `NEXT_PUBLIC_API_URL` pointing at the backend (see `.env`).

## Status

Backend currently implements `User` and `Task` (recursive parent/subtasks, skill/priority validated against constants) plus auth. Timer, analytics, and AI focus-validation/skill-classification layers described above are part of the product design but not yet fully implemented — check the `CLAUDE.md` files for current vs. planned scope.
