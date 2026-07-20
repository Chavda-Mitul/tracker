"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { MONTH_NAMES, parseDateKey, toDateKey } from "@/lib/date"

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]

// Keep in sync with the `w-64` class below.
export const CALENDAR_WIDTH = 256

function Calendar({
  value,
  onChange,
  className,
}: {
  value?: string
  onChange?: (value: string) => void
  className?: string
}) {
  const selected = parseDateKey(value)
  const today = new Date()
  const [viewDate, setViewDate] = React.useState(() => selected ?? today)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const startWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className={cn("w-64 select-none", className)}>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          className="sketch-btn bg-paper flex size-7 items-center justify-center"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="sketch-title text-sm font-bold tracking-wide text-ink">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          aria-label="Next month"
          className="sketch-btn bg-paper flex size-7 items-center justify-center"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day, i) => (
          <div
            key={i}
            className="flex h-7 items-center justify-center text-[11px] font-bold text-muted"
          >
            {day}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />

          const cellDate = new Date(year, month, day)
          const key = toDateKey(cellDate)
          const isSelected = key === value
          const isToday = key === toDateKey(today)

          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange?.(key)}
              aria-pressed={isSelected}
              className={cn(
                "flex h-7 items-center justify-center rounded-[8px_12px_8px_12px/10px_8px_12px_8px] border-2 text-xs font-bold transition-transform",
                isSelected
                  ? "border-ink bg-accent text-paper shadow-[2px_2px_0_0_var(--ink)]"
                  : "border-transparent text-ink hover:-translate-y-px hover:border-ink/40",
                isToday && !isSelected && "border-dashed border-ink/50"
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { Calendar }
