import { stopTimer } from "@/services/timer-service"
import { stopTimerInCache, upsertTaskInCache } from "@/modules/task/utils/task-cache"
import { useOptimisticTaskMutation } from "@/modules/task/hooks/useOptimisticTaskMutation"

export function useStopTimer() {
  return useOptimisticTaskMutation({
    mutationFn: stopTimer,
    action: "stopTimer",
    applyOptimistic: (queryClient, taskId: string) => stopTimerInCache(queryClient, taskId),
    applyServerData: upsertTaskInCache,
    onSuccess: (queryClient) => queryClient.invalidateQueries({ queryKey: ["tasks", "time-summary"] }),
  })
}
