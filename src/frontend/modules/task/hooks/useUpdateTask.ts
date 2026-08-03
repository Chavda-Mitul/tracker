import { TaskFormValues } from "@/types/task"
import { updateTask } from "@/services/task-service"
import { findTaskById, upsertTaskInCache } from "../utils/task-cache"
import { useOptimisticTaskMutation } from "./useOptimisticTaskMutation"

export function useUpdateTask() {
  return useOptimisticTaskMutation({
    mutationFn: updateTask,
    action: "update",
    applyOptimistic: (queryClient, values: TaskFormValues) => {
      const current = findTaskById(queryClient, values.id)
      if (!current) return
      // Subtask add/remove/reorder is diffed server-side; only patch the task's own fields here
      // and let the onSettled refetch reconcile the subtask tree.
      upsertTaskInCache(queryClient, { ...current, ...values, subtasks: current.subtasks })
    },
  })
}
