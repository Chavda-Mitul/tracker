import { useMutation, useQueryClient } from "@tanstack/react-query"
import { startTimer } from "@/services/timer-service"

export function useStartTimer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: startTimer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  })
}
