import { PRIORITIES, SKILLS } from "@/constants/task"


export type SubtaskFormValues = {
  id: string
  title: string
  description: string
  skill: (typeof SKILLS)[number]
  priority: (typeof PRIORITIES)[number]
  dueDate: string
  subtasks: SubtaskFormValues[]
}

export type TaskFormValues = SubtaskFormValues

export type TaskStatus = "PENDING" | "COMPLETED" | "DISCARDED"

export type TaskListItem = {
  id: string
  title: string
  description?: string
  skill: (typeof SKILLS)[number]
  priority?: (typeof PRIORITIES)[number]
  dueDate?: string
  isRunning?: boolean
  elapsedSeconds?: number
  startedAt?: string | null
  status: TaskStatus
  completedAt?: string | null
  subtasks: TaskListItem[]
}

export type GetTasksParams = {
  status?: TaskStatus
  from?: string
  to?: string
}

export type GetTasksResponse = {
  tasks: TaskListItem[]
  totalElapsedSeconds: number
}

