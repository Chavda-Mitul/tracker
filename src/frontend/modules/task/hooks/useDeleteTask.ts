import { deleteTask } from "@/services/task-service"
import { removeTaskFromCache } from "../utils/task-cache"
import { useOptimisticTaskMutation } from "./useOptimisticTaskMutation"

export function useDeleteTask() {
  return useOptimisticTaskMutation({
    mutationFn: deleteTask,
    action: "delete",
    applyOptimistic: (queryClient, id: string) => removeTaskFromCache(queryClient, id),
  })
}
