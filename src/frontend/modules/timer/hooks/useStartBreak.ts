import { useMutation, useQueryClient } from "@tanstack/react-query"
import { startBreak } from "@/services/break-service"

export function useStartBreak() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: startBreak,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["breaks"] }),
  })
}
