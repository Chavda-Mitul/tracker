import { useMutation, useQueryClient } from "@tanstack/react-query"
import { stopBreak } from "@/services/break-service"

export function useStopBreak() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: stopBreak,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["breaks"] }),
  })
}
