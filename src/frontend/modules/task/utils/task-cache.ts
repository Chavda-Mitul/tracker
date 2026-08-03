import { QueryClient } from "@tanstack/react-query"
import { GetTasksParams, GetTasksResponse, TaskListItem } from "@/types/task"

function matchesFilter(params: GetTasksParams, task: TaskListItem) {
  return !params.status || params.status === task.status
}

function removeById(tasks: TaskListItem[], id: string): TaskListItem[] {
  return tasks
    .filter((task) => task.id !== id)
    .map((task) => ({ ...task, subtasks: removeById(task.subtasks, id) }))
}

function replaceById(
  tasks: TaskListItem[],
  updated: TaskListItem
): { tasks: TaskListItem[]; found: boolean } {
  let found = false
  const next = tasks.map((task) => {
    if (task.id === updated.id) {
      found = true
      return { ...task, ...updated, subtasks: task.subtasks }
    }
    const child = replaceById(task.subtasks, updated)
    found = found || child.found
    return { ...task, subtasks: child.tasks }
  })
  return { tasks: next, found }
}

function findTaskListQueries(queryClient: QueryClient) {
  return queryClient.getQueryCache().findAll({ queryKey: ["tasks", {}] })
}

function findByPredicate(
  tasks: TaskListItem[],
  predicate: (task: TaskListItem) => boolean
): TaskListItem | undefined {
  for (const task of tasks) {
    if (predicate(task)) return task
    const found = findByPredicate(task.subtasks, predicate)
    if (found) return found
  }
  return undefined
}

function findInCache(
  queryClient: QueryClient,
  predicate: (task: TaskListItem) => boolean
): TaskListItem | undefined {
  for (const { queryKey } of findTaskListQueries(queryClient)) {
    const data = queryClient.getQueryData<GetTasksResponse>(queryKey)
    const found = data && findByPredicate(data.tasks, predicate)
    if (found) return found
  }
  return undefined
}

/** Mirrors the backend's elapsed-time accumulation for a task that was running until `now`. */
function accumulateElapsed(elapsedSeconds: number, startedAt: string | null | undefined, now: number) {
  if (!startedAt) return elapsedSeconds
  return elapsedSeconds + Math.max(0, Math.floor((now - Date.parse(startedAt)) / 1000))
}

function replaceByTempId(
  tasks: TaskListItem[],
  tempId: string,
  updated: TaskListItem
): { tasks: TaskListItem[]; found: boolean } {
  let found = false
  const next = tasks.map((task) => {
    if (task.id === tempId) {
      found = true
      return updated
    }
    const child = replaceByTempId(task.subtasks, tempId, updated)
    found = found || child.found
    return { ...task, subtasks: child.tasks }
  })
  return { tasks: next, found }
}

function updateTaskLists(
  queryClient: QueryClient,
  update: (old: GetTasksResponse, params: GetTasksParams) => GetTasksResponse
) {
  for (const { queryKey } of findTaskListQueries(queryClient)) {
    const params = (queryKey[1] ?? {}) as GetTasksParams
    queryClient.setQueryData<GetTasksResponse>(queryKey, (old) =>
      old && Array.isArray(old.tasks) ? update(old, params) : old
    )
  }
}

/** Adds a newly created task to every cached task list it matches. */
export function addTaskToCache(queryClient: QueryClient, task: TaskListItem) {
  updateTaskLists(queryClient, (old, params) =>
    matchesFilter(params, task) ? { ...old, tasks: [task, ...old.tasks] } : old
  )
}

/** Writes an updated task into every cached task list, moving it in/out of status-filtered lists as needed. */
export function upsertTaskInCache(queryClient: QueryClient, task: TaskListItem) {
  updateTaskLists(queryClient, (old, params) => {
    if (!matchesFilter(params, task)) return { ...old, tasks: removeById(old.tasks, task.id) }
    const { tasks, found } = replaceById(old.tasks, task)
    return { ...old, tasks: found ? tasks : [task, ...tasks] }
  })
}

/** Removes a deleted task from every cached task list. */
export function removeTaskFromCache(queryClient: QueryClient, id: string) {
  updateTaskLists(queryClient, (old) => ({ ...old, tasks: removeById(old.tasks, id) }))
}

/** Finds a task by id across every cached task list. */
export function findTaskById(queryClient: QueryClient, id: string): TaskListItem | undefined {
  return findInCache(queryClient, (task) => task.id === id)
}

/** Patches a cached task's status (and moves it in/out of status-filtered lists). */
export function setTaskStatusInCache(
  queryClient: QueryClient,
  id: string,
  status: TaskListItem["status"],
  completedAt: string | null
) {
  const current = findTaskById(queryClient, id)
  if (!current) return
  upsertTaskInCache(queryClient, { ...current, status, completedAt })
}

/** Optimistically starts a task's timer, stopping whichever other task was running (mirrors backend behavior). */
export function startTimerInCache(queryClient: QueryClient, taskId: string) {
  const now = Date.now()
  const running = findInCache(queryClient, (task) => task.isRunning === true)
  if (running && running.id !== taskId) {
    upsertTaskInCache(queryClient, {
      ...running,
      isRunning: false,
      startedAt: null,
      elapsedSeconds: accumulateElapsed(running.elapsedSeconds ?? 0, running.startedAt, now),
    })
  }
  const target = findTaskById(queryClient, taskId)
  if (!target) return
  upsertTaskInCache(queryClient, { ...target, isRunning: true, startedAt: new Date(now).toISOString() })
}

/** Optimistically stops a task's timer, folding the running time into `elapsedSeconds`. */
export function stopTimerInCache(queryClient: QueryClient, taskId: string) {
  const target = findTaskById(queryClient, taskId)
  if (!target) return
  upsertTaskInCache(queryClient, {
    ...target,
    isRunning: false,
    startedAt: null,
    elapsedSeconds: accumulateElapsed(target.elapsedSeconds ?? 0, target.startedAt, Date.now()),
  })
}

/** Swaps an optimistic (temp-id) task for the server-issued task once the create request resolves. */
export function replaceTaskId(queryClient: QueryClient, tempId: string, task: TaskListItem) {
  updateTaskLists(queryClient, (old) => {
    const { tasks, found } = replaceByTempId(old.tasks, tempId, task)
    return found ? { ...old, tasks } : old
  })
}

/** Snapshots every cached task list so it can be restored on mutation failure. */
export function snapshotTaskLists(queryClient: QueryClient) {
  return findTaskListQueries(queryClient).map(
    ({ queryKey }) => [queryKey, queryClient.getQueryData<GetTasksResponse>(queryKey)] as const
  )
}

/** Restores task lists from a snapshot taken via {@link snapshotTaskLists}. */
export function restoreTaskLists(
  queryClient: QueryClient,
  snapshot: ReturnType<typeof snapshotTaskLists>
) {
  for (const [queryKey, data] of snapshot) {
    queryClient.setQueryData(queryKey, data)
  }
}

/** Extracts the task id a mutation's variables refer to, whether variables are a bare id or a form payload. */
export function taskIdFromVariables(vars: unknown): string | undefined {
  if (typeof vars === "string") return vars
  if (vars && typeof vars === "object" && "id" in vars) return (vars as { id: string }).id
  return undefined
}
