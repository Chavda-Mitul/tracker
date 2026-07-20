import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTask } from "@/services/task-service"

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  })
}
