import { completeTask } from "@/services/task-service"
import { setTaskStatusInCache } from "../utils/task-cache"
import { useOptimisticTaskMutation } from "./useOptimisticTaskMutation"

export function useCompleteTask() {
  return useOptimisticTaskMutation({
    mutationFn: completeTask,
    action: "complete",
    applyOptimistic: (queryClient, id: string) =>
      setTaskStatusInCache(queryClient, id, "COMPLETED", new Date().toISOString()),
  })
}
