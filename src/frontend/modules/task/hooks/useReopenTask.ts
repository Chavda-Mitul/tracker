import { useMutation, useQueryClient } from "@tanstack/react-query"
import { reopenTask } from "@/services/task-service"

export function useReopenTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reopenTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  })
}
