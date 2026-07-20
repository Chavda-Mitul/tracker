import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateTask } from "@/services/task-service"

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  })
}
