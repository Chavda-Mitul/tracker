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
