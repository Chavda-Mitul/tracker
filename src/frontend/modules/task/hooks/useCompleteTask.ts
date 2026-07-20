import { useMutation, useQueryClient } from "@tanstack/react-query"
import { completeTask } from "@/services/task-service"

export function useCompleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: completeTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  })
}
