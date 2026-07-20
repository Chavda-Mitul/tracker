import { useMutation, useQueryClient } from "@tanstack/react-query"
import { stopTimer } from "@/services/timer-service"

export function useStopTimer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: stopTimer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  })
}
