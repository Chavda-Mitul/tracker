"use client"

import React from "react"
import { toast } from "sonner"

import { CreateTaskDrawer } from './components/create-task-drawer'
import { TaskList } from './components/task-list'
import { useGetTasks } from './hooks/useGetTasks'
import { useCreateTask } from './hooks/useCreateTask'
import { useUpdateTask } from './hooks/useUpdateTask'
import { useDeleteTask } from './hooks/useDeleteTask'
import { useCompleteTask } from './hooks/useCompleteTask'
import { useDiscardTask } from './hooks/useDiscardTask'
import { useReopenTask } from './hooks/useReopenTask'
import { useTimer } from '@/context/timer-context'
import { toTaskListItems } from './utils/task-list'
import { DatePicker } from '@/components/ui/date-picker'
import { Select } from '@/components/ui/select'
import { Clock } from '@/components/common/clock'
import { TaskStatus } from '@/types/task'
import { cn } from '@/lib/utils'
import { parseDateKey } from '@/lib/date'

const STATUS_TABS: { label: string; value: TaskStatus | "ALL" }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Discarded", value: "DISCARDED" },
  { label: "All", value: "ALL" },
]

type Granularity = "day" | "month" | "year"

function dateRangeFor(granularity: Granularity, anchor: string): { from: string; to: string } {
  const date = parseDateKey(anchor) ?? new Date()
  let from: Date
  let to: Date
  if (granularity === "day") {
    from = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  } else if (granularity === "month") {
    from = new Date(date.getFullYear(), date.getMonth(), 1)
    to = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  } else {
    from = new Date(date.getFullYear(), 0, 1)
    to = new Date(date.getFullYear() + 1, 0, 1)
  }
  return { from: from.toISOString(), to: to.toISOString() }
}

export default function TaskPage() {
  const [status, setStatus] = React.useState<TaskStatus | "ALL">("PENDING")
  const [granularity, setGranularity] = React.useState<Granularity>("day")
  const [anchorDate, setAnchorDate] = React.useState("")

  const showDateFilter = status === "COMPLETED"
  const range = showDateFilter && anchorDate ? dateRangeFor(granularity, anchorDate) : undefined

  const { data, isLoading } = useGetTasks({
    status: status === "ALL" ? undefined : status,
    from: range?.from,
    to: range?.to,
  })
  const tasks = data?.tasks ?? []
  const totalElapsedSeconds = data?.totalElapsedSeconds ?? 0

  const { mutate: createTaskMutation } = useCreateTask()
  const { mutate: updateTaskMutation } = useUpdateTask()
  const { mutate: deleteTaskMutation } = useDeleteTask()
  const { mutate: completeTaskMutation } = useCompleteTask()
  const { mutate: discardTaskMutation } = useDiscardTask()
  const { mutate: reopenTaskMutation } = useReopenTask()
  const createTask = (values: Parameters<typeof createTaskMutation>[0]) =>
    createTaskMutation(values, { onError: (error) => toast.error(error.message) })
  const updateTask = (values: Parameters<typeof updateTaskMutation>[0]) =>
    updateTaskMutation(values, { onError: (error) => toast.error(error.message) })
  const deleteTask = (id: Parameters<typeof deleteTaskMutation>[0]) =>
    deleteTaskMutation(id, { onError: (error) => toast.error(error.message) })
  const completeTask = (id: Parameters<typeof completeTaskMutation>[0]) =>
    completeTaskMutation(id, { onError: (error) => toast.error(error.message) })
  const discardTask = (id: Parameters<typeof discardTaskMutation>[0]) =>
    discardTaskMutation(id, { onError: (error) => toast.error(error.message) })
  const reopenTask = (id: Parameters<typeof reopenTaskMutation>[0]) =>
    reopenTaskMutation(id, { onError: (error) => toast.error(error.message) })
  const { runningTaskId, elapsedByTask, toggleTask } = useTimer()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="sketch-title text-2xl font-bold text-ink">Tasks</h1>
          <p className="text-sm text-muted">
            Today&apos;s task flow and past quest history.
          </p>
        </div>
        <CreateTaskDrawer onCreateTask={createTask} />
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={cn(
              "sketch-btn px-4 py-2 text-sm font-bold",
              status === tab.value ? "bg-slate-100 text-ink" : "bg-paper text-ink/70"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showDateFilter && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-32">
            <Select value={granularity} onChange={(e) => setGranularity(e.target.value as Granularity)}>
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </Select>
          </div>
          <div className="w-48">
            <DatePicker value={anchorDate} onChange={setAnchorDate} placeholder="Any time" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Hours Worked
            </span>
            <Clock seconds={totalElapsedSeconds} size="sm" />
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="sketch-border rounded-[10px_16px_10px_16px/14px_10px_16px_10px] border-dashed bg-paper px-3.5 py-3 text-sm text-muted">
          Loading quests...
        </p>
      ) : tasks.length === 0 ? (
        <p className="sketch-border rounded-[10px_16px_10px_16px/14px_10px_16px_10px] border-dashed bg-paper px-3.5 py-3 text-sm text-muted">
          No quests here yet.
        </p>
      ) : (
        <TaskList
          tasks={toTaskListItems(tasks, runningTaskId, elapsedByTask)}
          onToggleTimer={toggleTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onCompleteTask={completeTask}
          onDiscardTask={discardTask}
          onReopenTask={reopenTask}
        />
      )}
    </div>
  )
}
