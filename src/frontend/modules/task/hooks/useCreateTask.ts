import { TaskFormValues, TaskListItem } from "@/types/task"
import { createTask } from "@/services/task-service"
import { addTaskToCache, replaceTaskId } from "../utils/task-cache"
import { useOptimisticTaskMutation } from "./useOptimisticTaskMutation"

function toOptimisticTaskListItem(values: TaskFormValues): TaskListItem {
  return { ...values, status: "PENDING", subtasks: values.subtasks.map(toOptimisticTaskListItem) }
}

export function useCreateTask() {
  const mutation = useOptimisticTaskMutation({
    mutationFn: createTask,
    action: "create",
    applyOptimistic: (queryClient, values: TaskFormValues) =>
      addTaskToCache(queryClient, toOptimisticTaskListItem(values)),
    onSuccess: (queryClient, task, values) => replaceTaskId(queryClient, values.id, task),
  })

  const mutate: typeof mutation.mutate = (values, options) =>
    mutation.mutate({ ...values, id: crypto.randomUUID() }, options)

  return { ...mutation, mutate }
}
