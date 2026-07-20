import { apiClient } from "@/lib/api-client"
import { BreakRecord } from "@/types/break"

export async function startBreak(reason: string): Promise<BreakRecord> {
  return apiClient.post("/breaks/start", { reason })
}

export async function stopBreak(): Promise<BreakRecord> {
  return apiClient.post("/breaks/stop")
}

export async function getBreaks(params: { from?: string; to?: string } = {}): Promise<BreakRecord[]> {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => !!value) as [string, string][]
  ).toString()
  return apiClient.get(`/breaks${query ? `?${query}` : ""}`)
}
