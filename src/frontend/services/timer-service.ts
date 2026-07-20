import { apiClient } from "@/lib/api-client"
import { TaskListItem } from "@/types/task"

export async function startTimer(taskId: string): Promise<TaskListItem> {
  return apiClient.post(`/tasks/${taskId}/start`)
}

export async function stopTimer(taskId: string): Promise<TaskListItem> {
  return apiClient.post(`/tasks/${taskId}/stop`)
}
