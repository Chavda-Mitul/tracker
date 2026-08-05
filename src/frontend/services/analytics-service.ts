import { apiClient } from "@/lib/api-client"
import { ActivityHeatmapResponse } from "@/types/analytics"

export async function getActivityHeatmap(params: {
  from: string
  to: string
}): Promise<ActivityHeatmapResponse> {
  const query = new URLSearchParams(params).toString()
  return apiClient.get(`/activity/heatmap?${query}`)
}
