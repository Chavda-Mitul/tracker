import { useQuery } from "@tanstack/react-query"
import { getBreaks } from "@/services/break-service"

export function useGetBreaks(params: { from?: string; to?: string } = {}) {
  return useQuery({ queryKey: ["breaks", params], queryFn: () => getBreaks(params) })
}
