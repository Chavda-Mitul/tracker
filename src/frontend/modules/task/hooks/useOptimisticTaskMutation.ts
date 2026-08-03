import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { snapshotTaskLists, restoreTaskLists } from "../utils/task-cache"

type Snapshot = ReturnType<typeof snapshotTaskLists>

/** Shared query key prefix so `useIsMutating({ queryKey: TASK_MUTATION_KEY })` can find any in-flight task mutation. */
export const TASK_MUTATION_KEY = ["tasks", "mutate"]

export function useOptimisticTaskMutation<TVars, TData>({
  mutationFn,
  applyOptimistic,
  action,
  onSuccess,
  applyServerData,
}: {
  mutationFn: (vars: TVars) => Promise<TData>
  applyOptimistic: (queryClient: QueryClient, vars: TVars) => void
  action: string
  onSuccess?: (queryClient: QueryClient, data: TData, vars: TVars) => void
  /** When provided, writes the mutation's server response directly into the cache instead of relying on an invalidate+refetch round trip. */
  applyServerData?: (queryClient: QueryClient, data: TData) => void
}) {
  const queryClient = useQueryClient()

  return useMutation<TData, Error, TVars, { snapshot: Snapshot }>({
    mutationKey: [...TASK_MUTATION_KEY, action],
    mutationFn,
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] })
      const snapshot = snapshotTaskLists(queryClient)
      applyOptimistic(queryClient, vars)
      return { snapshot }
    },
    onError: (error, _vars, context) => {
      if (context) restoreTaskLists(queryClient, context.snapshot)
      toast.error(error.message)
    },
    onSuccess: (data, vars) => {
      onSuccess?.(queryClient, data, vars)
      applyServerData?.(queryClient, data)
    },
    onSettled: (_data, error) => {
      if (error || !applyServerData) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] })
      }
    },
  })
}
