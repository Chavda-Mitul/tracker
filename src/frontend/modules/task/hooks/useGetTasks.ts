import { useQuery } from "@tanstack/react-query"
import { getTasks } from "@/services/task-service"
import { GetTasksParams } from "@/types/task"

export function useGetTasks(params: GetTasksParams = {}) {
  return useQuery({ queryKey: ["tasks", params], queryFn: () => getTasks(params) })
}
