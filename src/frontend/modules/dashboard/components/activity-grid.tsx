"use client"

import { useState } from "react"

import { toDateKey, MONTH_NAMES } from "@/lib/date"
import { cn } from "@/lib/utils"
import { ActivityDay } from "@/types/analytics"

const DAYS_TO_SHOW = 365

const LEVEL_COLORS = [
  "bg-paper", // 0 hours
  "bg-accent/20", // < 1h
  "bg-accent/45", // 1-2h
  "bg-accent/70", // 2-4h
  "bg-accent", // 4h+
]

type Day = { key: string; date: Date; workedSeconds: number }

function levelFor(workedSeconds: number): number {
  const hours = workedSeconds / 3600
  if (hours <= 0) return 0
  if (hours < 1) return 1
  if (hours < 2) return 2
  if (hours < 4) return 3
  return 4
}

function buildWeeks(secondsByDay: Map<string, number>): Day[][] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(start.getDate() - (DAYS_TO_SHOW - 1))
  // Align to the start of the week (Sunday) so columns line up like GitHub's grid.
  start.setDate(start.getDate() - start.getDay())

  const days: Day[] = []
  for (let cursor = new Date(start); cursor <= today; cursor.setDate(cursor.getDate() + 1)) {
    const date = new Date(cursor)
    const key = toDateKey(date)
    days.push({ key, date, workedSeconds: secondsByDay.get(key) ?? 0 })
  }

  const weeks: Day[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

function monthLabelFor(week: Day[], prevWeek: Day[] | undefined): string | null {
  const firstDay = week[0]
  if (!prevWeek && firstDay.date.getDate() <= 7) return MONTH_NAMES[firstDay.date.getMonth()]
  if (prevWeek && prevWeek[0].date.getMonth() !== firstDay.date.getMonth()) {
    return MONTH_NAMES[firstDay.date.getMonth()]
  }
  return null
}

function tooltipFor(date: Date, workedSeconds: number): string {
  const label = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  const hours = workedSeconds / 3600
  if (hours <= 0) return `No time logged on ${label}`
  return `${hours.toFixed(1)} hrs logged on ${label}`
}

export function ActivityGrid({ days }: { days: ActivityDay[] }) {
  const [hovered, setHovered] = useState<{ x: number; y: number; text: string } | null>(null)

  const secondsByDay = new Map(days.map((day) => [day.date, day.workedSeconds]))
  const weeks = buildWeeks(secondsByDay)
  const totalHours = days.reduce((sum, day) => sum + day.workedSeconds, 0) / 3600
  const gridColumns = `repeat(${weeks.length}, minmax(0, 1fr))`

  function showTooltip(event: React.MouseEvent<HTMLElement>, day: Day) {
    const rect = event.currentTarget.getBoundingClientRect()
    setHovered({ x: rect.left + rect.width / 2, y: rect.top, text: tooltipFor(day.date, day.workedSeconds) })
  }

  return (
    <div className="sketch-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">
          {totalHours.toFixed(1)} hrs logged in the last year
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span>Less</span>
          {LEVEL_COLORS.map((color) => (
            <span key={color} className={cn("sketch-border size-2.5 rounded-[2px]", color)} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="grid w-full gap-[3px]" style={{ gridTemplateColumns: gridColumns }}>
        {weeks.map((week, i) => {
          const label = monthLabelFor(week, weeks[i - 1])
          return (
            <div key={week[0].key} className="text-[10px] font-bold text-muted">
              {label ?? " "}
            </div>
          )
        })}
      </div>

      <div className="grid w-full gap-[3px]" style={{ gridTemplateColumns: gridColumns }}>
        {weeks.map((week) => (
          <div key={week[0].key} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.key}
                onMouseEnter={(event) => showTooltip(event, day)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "sketch-border aspect-square w-full rounded-[2px] transition-transform hover:scale-125",
                  LEVEL_COLORS[levelFor(day.workedSeconds)],
                )}
              />
            ))}
          </div>
        ))}
      </div>

      {hovered && (
        <div
          className="sketch-card pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap px-2.5 py-1.5 text-xs font-bold text-ink"
          style={{ left: hovered.x, top: hovered.y }}
        >
          {hovered.text}
        </div>
      )}
    </div>
  )
}
