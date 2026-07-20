import { TaskListItem } from "@/types/task"

export function toTaskListItems(
  tasks: TaskListItem[],
  runningTaskId: string | null,
  elapsedByTask: Record<string, number>
): TaskListItem[] {
  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    skill: task.skill,
    priority: task.priority,
    dueDate: task.dueDate,
    isRunning: task.id === runningTaskId,
    elapsedSeconds: elapsedByTask[task.id] ?? 0,
    status: task.status,
    completedAt: task.completedAt,
    subtasks: toTaskListItems(task.subtasks, runningTaskId, elapsedByTask),
  }))
}
