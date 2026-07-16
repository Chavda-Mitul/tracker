# Backend Plan

## Done
- Fastify server, Prisma (Postgres), JWT plugin, app-secret preHandler
- Auth: `POST /auth/signup`, `POST /auth/signin` (controller/service/repository split)
- `User` model in schema.prisma

## 1. Schema (prisma/schema.prisma)
- [ ] `Task` model: id, userId, parentId (self-relation, nullable) for subtasks, title, description, status, category (skill tag), timestamps
- [ ] `TimeLog` model: id, userId, taskId (nullable — null when it's a break), type (`work` | `break`), reason (nullable, for breaks), startedAt, endedAt (nullable while running)
- [ ] Indexes: `TimeLog(userId, endedAt)` for "find active timer", `Task(userId, parentId)`
- [ ] Migration + `prisma generate`

## 2. Tasks (routes/controllers/services/repositories, mirror auth's layering)
- [ ] `POST /tasks` — create (optional parentId)
- [ ] `GET /tasks` — list user's tasks, nested with subtasks; support today/past filter by date
- [ ] `PATCH /tasks/:id` — update title/description/status/category
- [ ] `DELETE /tasks/:id` — delete (cascade subtasks via schema `onDelete: Cascade`)
- [ ] All routes behind JWT auth middleware, scoped to `request.user.id`

## 3. Timer / Clock (the stateless server-driven part)
- [ ] `POST /timer/start` — body: taskId. Reject if user already has a running TimeLog (work or break)
- [ ] `POST /timer/stop` — sets `endedAt` on the user's running work TimeLog
- [ ] `POST /timer/break/start` — body: reason. Same one-active-timer rule
- [ ] `POST /timer/break/stop`
- [ ] `GET /timer/active` — returns the currently running TimeLog (if any) so frontend can resync after reload — this is what makes it "server-driven stateless"
- [ ] Duration is always `endedAt - startedAt`, computed on read, never stored client-side

## 4. Analytics (only once tasks/timer above are working — skip for now, add when frontend charts need it)
- [ ] `GET /analytics/summary?range=day|week` — bucket TimeLog durations by day/skill

## Notes
- No separate `Break` table — reuse `TimeLog` with `type` field. Skipped a second model: same shape, one field tells them apart.
- No background job for stale/orphaned open timers yet — add only if it becomes a real problem (e.g. a cron that auto-closes TimeLogs open > 24h).
