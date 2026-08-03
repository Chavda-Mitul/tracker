import { reopenTask } from "@/services/task-service"
import { setTaskStatusInCache } from "../utils/task-cache"
import { useOptimisticTaskMutation } from "./useOptimisticTaskMutation"

export function useReopenTask() {
  return useOptimisticTaskMutation({
    mutationFn: reopenTask,
    action: "reopen",
    applyOptimistic: (queryClient, id: string) =>
      setTaskStatusInCache(queryClient, id, "PENDING", null),
  })
}
