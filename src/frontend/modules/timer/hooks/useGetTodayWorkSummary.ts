import { useQuery } from "@tanstack/react-query"
import { getTodayWorkSummary } from "@/services/task-service"

export function useGetTodayWorkSummary(params: { from: string; to: string }) {
  return useQuery({
    queryKey: ["tasks", "time-summary", params],
    queryFn: () => getTodayWorkSummary(params),
  })
}
