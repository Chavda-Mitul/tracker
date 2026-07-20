"use client"

import * as React from "react"
import { useGetTasks } from "@/modules/task/hooks/useGetTasks"
import { useStartTimer } from "@/modules/timer/hooks/useStartTimer"
import { useStopTimer } from "@/modules/timer/hooks/useStopTimer"
import { useGetBreaks } from "@/modules/timer/hooks/useGetBreaks"
import { useStartBreak } from "@/modules/timer/hooks/useStartBreak"
import { useStopBreak } from "@/modules/timer/hooks/useStopBreak"
import { useGetTodayWorkSummary } from "@/modules/timer/hooks/useGetTodayWorkSummary"
import { TaskListItem } from "@/types/task"
import { toDateKey } from "@/lib/date"

type TimerContextValue = {
  runningTaskId: string | null
  elapsedByTask: Record<string, number>
  toggleTask: (taskId: string) => void
  totalWorkSeconds: number
  isWorking: boolean
  isOnBreak: boolean
  breakReason: string | null
  totalBreakSeconds: number
  startBreak: (reason: string) => void
  stopBreak: () => void
}

const TimerContext = React.createContext<TimerContextValue | null>(null)

function findRunningTask(tasks: TaskListItem[]): TaskListItem | null {
  for (const task of tasks) {
    if (task.isRunning) return task
    const found = findRunningTask(task.subtasks)
    if (found) return found
  }
  return null
}

function flattenTasks(tasks: TaskListItem[]): TaskListItem[] {
  return tasks.flatMap((task) => [task, ...flattenTasks(task.subtasks)])
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { data } = useGetTasks()
  const tasks = data?.tasks ?? []
  const startTaskMutation = useStartTimer()
  const stopTaskMutation = useStopTimer()

  const [todayKey, setTodayKey] = React.useState(() => toDateKey(new Date()))
  const { from, to } = React.useMemo(() => {
    const start = new Date(`${todayKey}T00:00:00`)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return { from: start.toISOString(), to: end.toISOString() }
  }, [todayKey])

  const { data: breaks = [] } = useGetBreaks({ from, to })
  const startBreakMutation = useStartBreak()
  const stopBreakMutation = useStopBreak()

  const { data: workSummary } = useGetTodayWorkSummary({ from, to })

  const runningTask = findRunningTask(tasks)
  const runningTaskId = runningTask?.id ?? null

  const activeBreak = breaks.find((b) => !b.endedAt) ?? null
  const isOnBreak = activeBreak !== null

  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    if (!runningTaskId && !isOnBreak) return
    const interval = setInterval(() => {
      setNow(Date.now())
      const currentKey = toDateKey(new Date())
      setTodayKey((prev) => (prev === currentKey ? prev : currentKey))
    }, 1000)
    return () => clearInterval(interval)
  }, [runningTaskId, isOnBreak])

  const elapsedByTask = React.useMemo(() => {
    const map: Record<string, number> = {}
    for (const task of flattenTasks(tasks)) {
      let seconds = task.elapsedSeconds ?? 0
      if (task.isRunning && task.startedAt) {
        seconds += Math.max(0, Math.floor((now - Date.parse(task.startedAt)) / 1000))
      }
      map[task.id] = seconds
    }
    return map
  }, [tasks, now])

  const toggleTask = (taskId: string) => {
    if (runningTaskId === taskId) {
      stopTaskMutation.mutate(taskId)
    } else {
      startTaskMutation.mutate(taskId)
    }
  }

  const startBreak = (reason: string) => {
    if (runningTaskId) {
      stopTaskMutation.mutate(runningTaskId)
    }
    startBreakMutation.mutate(reason)
  }

  const stopBreak = () => {
    stopBreakMutation.mutate()
  }

  const totalWorkSeconds = React.useMemo(() => {
    const workedSeconds = workSummary?.workedSeconds ?? 0
    if (!runningTaskId || !workSummary) return workedSeconds
    const liveDelta = Math.max(0, Math.floor((now - Date.parse(workSummary.asOf)) / 1000))
    return workedSeconds + liveDelta
  }, [workSummary, runningTaskId, now])

  const totalBreakSeconds = React.useMemo(() => {
    return breaks.reduce((sum, breakRecord) => {
      const end = breakRecord.endedAt ? Date.parse(breakRecord.endedAt) : now
      return sum + Math.max(0, Math.floor((end - Date.parse(breakRecord.startedAt)) / 1000))
    }, 0)
  }, [breaks, now])

  const value: TimerContextValue = {
    runningTaskId,
    elapsedByTask,
    toggleTask,
    totalWorkSeconds,
    isWorking: runningTaskId !== null,
    isOnBreak,
    breakReason: activeBreak?.reason ?? null,
    totalBreakSeconds,
    startBreak,
    stopBreak,
  }

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  )
}

export function useTimer() {
  const ctx = React.useContext(TimerContext)
  if (!ctx) throw new Error("useTimer must be used within a TimerProvider")
  return ctx
}
