# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# Project Overview

This project is a resilient, server-driven Task Timer & Productivity Analytics System featuring intelligent Focus Validation. Unlike traditional frontend-only timers that break when a browser tab closes or a laptop goes to sleep, this system handles time tracking statelessly on the backend using timestamps, ensuring complete data accuracy. It is designed to track recursive tasks and subtasks, visualize daily productivity metrics, and actively verify whether the user is working on their stated tasks or getting distracted.

## Key Features
- **Server-Driven Stateless Timer**: Timer states are managed on the server using `started_at` and `ended_at` timestamps. Closing the frontend dashboard will not disrupt or lose track of active time tracking.
- **Hierarchical Task Management**: Supports nested, recursive to-do structures (tasks within tasks) allowing large objectives to be broken down into smaller, manageable subtasks.
- **Dual View Workflow Dashboard**: A clean, unified split UI layout showing "Today's Task Flow" (to quickly create and run current tasks) alongside a "Past Tasks Review" for historical tracking.
- **Productivity Analytics Engine**: Aggregates time logs into hourly, daily, or weekly data buckets to generate visual charts (e.g., Deep Work hours vs. Distraction times).
- **AI Focus Validation Agent**: A lightweight background desktop tracking script polls the active OS window title or active browser tab context every 60 seconds. An AI layer evaluates this context against the active running task to detect alignment and automatically logs "distracted" blocks on the graph when the user drifts away from work.

## Technology Stack
| Layer | Technology | Primary Role / Benefit |
| --- | --- | --- |
| Frontend | Next.js (App Router), Tailwind CSS, Shadcn UI | Delivers a clean, accessible dashboard layout with dedicated sections for task input, active tracking, and past records. |
| Data Fetching Layer | React Query (TanStack Query) | Abstracts the network layer using a Repository/Service pattern, preventing redundant API calls and automatically caching tracking data. |
| Charts | Recharts / Tremor | Powers the visualization components that graph daily productivity flow and focus distribution metrics. |
| Backend API | Node.js (TypeScript) + Express / Fastify | Handles the timer lifecycle logic, timestamp duration math, and recursive parent-subtask database updates. |
| Database & ORM | PostgreSQL + Prisma | Offers an end-to-end type-safe database layer that cleanly queries nested, self-referential task relationships. |
| Local OS Agent | Node.js (`get-windows`) or Python | Runs as a lightweight local background daemon to securely fetch the current foreground application window title. |
| AI Assessment | LangChain / Structured LLM Outputs | Evaluates the string context of active windows against current task titles to return clean structured validation data (e.g., `{ is_distracted: true }`). |

# Design & Product Direction

## Visual theme: Sketch UI
The entire app's UI should look hand-drawn / sketch-style (think rough.js / sketchy borders, hand-drawn-looking buttons, cards, inputs, icons) rather than a clean flat/material look. Apply this consistently across every component and page — buttons, cards, drawers, inputs, charts, etc. should all share the sketchy hand-drawn aesthetic.

## Product concept: Solo Leveling-style progress system
This is a time/task tracker themed like the anime "Solo Leveling": the user levels up individual skill categories based on time spent doing tasks in that category, similar to how the protagonist levels up stats.

- Each skill/category (e.g. Coding, Frontend, Backend, Design, etc.) has its own level and XP bar.
- Time spent on tasks tagged to a category contributes XP to that category's level — e.g. more time spent on frontend tasks levels up "Frontend", more time on coding tasks levels up "Coding".
- Leveling up should feel like an RPG stat/skill system (level numbers, XP progress bars, rank titles, level-up moments) in the spirit of Solo Leveling.
- Keep this RPG/leveling flavor consistent with the sketch UI theme above (e.g. hand-drawn stat panels/XP bars rather than generic progress bars).

## Skill scoring / XP derivation
Skill levels are not manually assigned — they are derived automatically from the user's completed task history:
- Every completed task the user has logged so far is analyzed by an AI layer that classifies which skill(s) the task belongs to (e.g. "Frontend", "DSA", "Backend", "Design", etc.) from the task's title/description/content.
- Time spent on a task is attributed as XP to whichever skill(s) the AI classified that task under — e.g. time spent on a task the AI tags as "Frontend" increases the Frontend skill level; time spent on a task tagged "DSA" increases the DSA skill level.
- This classification + scoring should run over the full backlog of previously completed tasks (not just new ones going forward), so skill levels reflect the user's entire task history retroactively.
- The AI Assessment layer (LangChain / structured LLM outputs, per the tech stack above) is the same layer responsible for both focus validation and this task-to-skill classification — reuse it rather than building a separate classifier.

# Commands

```bash
npm run dev     # start dev server (localhost:3000)
npm run build   # production build
npm run start   # run production build
npm run lint    # eslint (flat config: eslint-config-next core-web-vitals + typescript)
```

There is no test runner configured in this package — don't assume one.

This repo uses `pnpm` (`pnpm-lock.yaml`, `pnpm-workspace.yaml` present) even though npm scripts are defined; prefer `pnpm` for installs if adding dependencies.

# Architecture

## This is not the Next.js you know
Per `AGENTS.md`, this Next.js version (16.2.10) has breaking changes from training-data Next.js. One confirmed instance: **route protection lives in `proxy.ts` at the project root, not `middleware.ts`** — the file-convention was renamed (see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Before using any App Router convention or API you're not 100% sure about, check `node_modules/next/dist/docs/` first rather than relying on prior knowledge.

## Layering: services -> hooks -> components
Every piece of server data flows through three fixed layers, in this order:

1. **`services/*-service.ts`** — plain async functions that call `apiClient` and return typed data (e.g. `services/task-service.ts`, `services/auth-service.ts`). No React here.
2. **`modules/<feature>/hooks/use*.ts`** — one React Query hook per service function, wrapping it in `useQuery` (reads) or `useMutation` (writes) (e.g. `modules/task/hooks/useGetTasks.ts`, `modules/task/hooks/useCreateTask.ts`). Mutations invalidate the relevant query key on success.
3. **`modules/<feature>/components/*`** and **`modules/<feature>/index.tsx`** — consume the hooks. Components never call `apiClient` or a service function directly, and never call `fetch` directly.

This pattern is intentional and consistently enforced — when adding a new API call, add a service function first, then a hook, then wire it into a component.

`lib/api-client.ts` is the single fetch wrapper (`apiClient.get/post/put/delete`): it injects `NEXT_PUBLIC_API_URL`, the `x-app-secret` header, and the auth bearer token (read via `lib/cookies.ts` from the `AUTH_TOKEN_COOKIE` cookie), and throws `ApiError` (`lib/api-error.ts`) on non-OK responses.

## Module structure
Feature code lives under `modules/<feature>/` (currently `auth`, `task`), each with its own `components/`, `hooks/`, and optionally `utils/`. `modules/<feature>/index.tsx` is typically the feature's top-level composed view, imported into an `app/*/page.tsx` route. Cross-feature/shared UI lives in `components/common/` (e.g. `app-shell`, `nav-drawer`); shadcn primitives live in `components/ui/` (style preset `base-sera`, base color `taupe` — see `components.json`).

## Auth & route protection
- `AUTH_TOKEN_COOKIE` (`"token"`, from `constants/auth.ts`) is the single source of truth for auth state, set/read via `lib/cookies.ts`.
- `proxy.ts` redirects unauthenticated requests away from any path not in `PUBLIC_PATHS` (`constants/routes.ts`) to `/login`, and redirects authenticated requests away from public auth pages back to `/`.
- `constants/routes.ts` (`ROUTES`) is the canonical route map — use it instead of hardcoding path strings.

## State
- Server state (tasks, auth) goes through React Query (`providers/query-provider.tsx` wraps the app in `app/layout.tsx`).
- `context/timer-context.tsx` (`TimerProvider`/`useTimer`) holds client-only, ephemeral timer/break UI state (ticking elapsed seconds, running task id, break tracking) — this is local UI state layered on top of the server-driven timer concept described above, not a replacement for it.

## Path aliases
`@/*` maps to the repo root (see `tsconfig.json`), matching the shadcn aliases in `components.json` (`@/components`, `@/lib`, `@/hooks`, `@/components/ui`).
