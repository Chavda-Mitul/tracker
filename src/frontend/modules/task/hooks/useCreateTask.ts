import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTask } from "@/services/task-service"
import { addTaskToCache } from "../utils/task-cache"

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTask,
    onSuccess: (task) => {
      addTaskToCache(queryClient, task)
      queryClient.invalidateQueries({ queryKey: ["tasks"], refetchType: "none" })
    },
  })
}
