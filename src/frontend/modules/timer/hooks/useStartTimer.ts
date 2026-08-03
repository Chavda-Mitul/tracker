import { startTimer } from "@/services/timer-service"
import { startTimerInCache, upsertTaskInCache } from "@/modules/task/utils/task-cache"
import { useOptimisticTaskMutation } from "@/modules/task/hooks/useOptimisticTaskMutation"

export function useStartTimer() {
  return useOptimisticTaskMutation({
    mutationFn: startTimer,
    action: "startTimer",
    applyOptimistic: (queryClient, taskId: string) => startTimerInCache(queryClient, taskId),
    applyServerData: upsertTaskInCache,
    onSuccess: (queryClient) => queryClient.invalidateQueries({ queryKey: ["tasks", "time-summary"] }),
  })
}
