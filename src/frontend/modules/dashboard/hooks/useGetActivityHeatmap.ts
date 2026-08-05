import { useQuery } from "@tanstack/react-query"
import { getActivityHeatmap } from "@/services/analytics-service"

export function useGetActivityHeatmap(params: { from: string; to: string }) {
  return useQuery({
    queryKey: ["activity", "heatmap", params],
    queryFn: () => getActivityHeatmap(params),
  })
}
