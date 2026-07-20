import { SubtaskFormValues } from "@/types/task"

export function removeSubtaskAtPath(
  subtasks: SubtaskFormValues[],
  path: number[]
): SubtaskFormValues[] {
  const [index, ...rest] = path
  if (rest.length === 0) {
    return subtasks.filter((_, i) => i !== index)
  }
  return subtasks.map((subtask, i) =>
    i === index
      ? { ...subtask, subtasks: removeSubtaskAtPath(subtask.subtasks, rest) }
      : subtask
  )
}
