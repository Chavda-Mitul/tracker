import { useMutation, useQueryClient } from "@tanstack/react-query"
import { discardTask } from "@/services/task-service"

export function useDiscardTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: discardTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  })
}
