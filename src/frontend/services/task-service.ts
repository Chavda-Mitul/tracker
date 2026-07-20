import { apiClient } from "@/lib/api-client"
import { GetTasksParams, GetTasksResponse, TaskFormValues, TaskListItem } from "@/types/task"

export async function createTask(values: TaskFormValues): Promise<TaskListItem> {
  return apiClient.post("/tasks", values)
}

export async function getTasks(params: GetTasksParams = {}): Promise<GetTasksResponse> {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => !!value) as [string, string][]
  ).toString()
  return apiClient.get(`/tasks${query ? `?${query}` : ""}`)
}

export async function getTodayWorkSummary(params: {
  from: string
  to: string
}): Promise<{ workedSeconds: number; asOf: string }> {
  const query = new URLSearchParams(params).toString()
  return apiClient.get(`/tasks/time-summary?${query}`)
}

export async function updateTask(values: TaskFormValues): Promise<TaskListItem> {
  return apiClient.patch(`/tasks/${values.id}`, values)
}

export async function deleteTask(id: string): Promise<void> {
  return apiClient.delete(`/tasks/${id}`)
}

export async function completeTask(id: string): Promise<TaskListItem> {
  return apiClient.post(`/tasks/${id}/complete`)
}

export async function discardTask(id: string): Promise<TaskListItem> {
  return apiClient.post(`/tasks/${id}/discard`)
}

export async function reopenTask(id: string): Promise<TaskListItem> {
  return apiClient.post(`/tasks/${id}/reopen`)
}
