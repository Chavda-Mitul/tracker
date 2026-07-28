import { useMutation, useQueryClient } from "@tanstack/react-query"
import { completeTask } from "@/services/task-service"
import { upsertTaskInCache } from "../utils/task-cache"

export function useCompleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: completeTask,
    onSuccess: (task) => {
      upsertTaskInCache(queryClient, task)
      queryClient.invalidateQueries({ queryKey: ["tasks"], refetchType: "none" })
    },
  })
}
