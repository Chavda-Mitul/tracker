"use client"

import React from "react"

import { ActivityGrid } from "./components/activity-grid"
import { useGetActivityHeatmap } from "./hooks/useGetActivityHeatmap"

const DAYS_TO_SHOW = 365

function activityRange(): { from: string; to: string } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const from = new Date(today)
  from.setDate(from.getDate() - (DAYS_TO_SHOW - 1))
  const to = new Date(today)
  to.setDate(to.getDate() + 1)
  return { from: from.toISOString(), to: to.toISOString() }
}

export default function DashboardPage() {
  const range = React.useMemo(() => activityRange(), [])
  const { data, isLoading } = useGetActivityHeatmap(range)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4 sm:p-8">
      <div>
        <h1 className="sketch-title text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-muted">Your activity over the past year.</p>
      </div>

      {isLoading ? (
        <p className="sketch-border rounded-[10px_16px_10px_16px/14px_10px_16px_10px] border-dashed bg-paper px-3.5 py-3 text-sm text-muted">
          Loading activity...
        </p>
      ) : (
        <ActivityGrid days={data?.days ?? []} />
      )}
    </div>
  )
}
