# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

This is a monorepo with two independent packages, each with its own `CLAUDE.md` — **read the relevant one before working in that package**, they contain the real architecture detail:

- `src/backend/` — Fastify 5 + Prisma API. See `src/backend/CLAUDE.md`.
- `src/frontend/` — Next.js 16 app. See `src/frontend/CLAUDE.md` (which pulls in `src/frontend/AGENTS.md`).

There is no root `package.json` / workspace tooling tying them together — run commands from inside each package directory.

## Commands

Backend (from `src/backend/`):
```bash
npm run dev             # tsx watch, hot reload
npm run build            # prisma generate && tsc
npm run lint / lint:fix
npm run prisma:generate  # regenerate client to src/generated/prisma (not node_modules)
npm run prisma:migrate
```
No backend test suite is configured.

Frontend (from `src/frontend/`, use `pnpm` — repo has `pnpm-lock.yaml`/`pnpm-workspace.yaml` despite npm-style scripts):
```bash
pnpm dev
pnpm build
pnpm lint
```
No frontend test suite is configured.

## Product context

Task Timer & Productivity Analytics System, themed like *Solo Leveling*: time spent on tasks levels up per-skill XP bars (Frontend, Backend, DSA, Design, etc.), classified automatically by an AI layer from task history. The timer is server-driven and stateless — `started_at`/`ended_at` timestamps on the backend, not client-side ticking state, so closing the browser or sleeping the laptop never loses tracked time.

Currently implemented: `User` and `Task` (recursive parent/subtasks, `skill`/`priority` validated against constants) plus auth, on the backend; task list/CRUD, timer UI state, and auth on the frontend. Timer persistence wiring, analytics aggregation, and the AI skill-classification/focus-validation layer are designed but not fully built — check the package `CLAUDE.md` files for current vs. planned scope before assuming a feature exists.

## Cross-cutting conventions

- **Layered architecture on both sides**, and each layer only talks to the adjacent one — don't skip a layer:
  - Backend: `routes → controllers → services → repositories` (see `src/backend/CLAUDE.md` for the full request-flow diagram).
  - Frontend: `services → hooks (React Query) → components` (see `src/frontend/CLAUDE.md`).
- **Sketch/hand-drawn UI theme** — every frontend component (buttons, cards, inputs, charts, XP bars) should follow a rough.js-style sketchy visual look, not a flat/material one.
- Frontend is on **Next.js 16.2.10**, which has breaking changes from older Next.js training data (e.g. route protection lives in `proxy.ts`, not `middleware.ts`). Check `node_modules/next/dist/docs/` before relying on prior Next.js knowledge.
