import { discardTask } from "@/services/task-service"
import { setTaskStatusInCache } from "../utils/task-cache"
import { useOptimisticTaskMutation } from "./useOptimisticTaskMutation"

export function useDiscardTask() {
  return useOptimisticTaskMutation({
    mutationFn: discardTask,
    action: "discard",
    applyOptimistic: (queryClient, id: string) =>
      setTaskStatusInCache(queryClient, id, "DISCARDED", new Date().toISOString()),
  })
}
