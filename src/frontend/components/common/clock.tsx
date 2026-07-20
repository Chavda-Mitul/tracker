"use client"

import * as React from "react"

function splitDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const days = Math.floor(safeSeconds / 86400)
  const hours = Math.floor((safeSeconds % 86400) / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60
  return { days, hours, minutes, seconds }
}

function pad(value: number) {
  return value.toString().padStart(2, "0")
}

export function Clock({
  seconds,
  live = false,
  size = "default",
}: {
  seconds: number
  live?: boolean
  size?: "default" | "sm"
}) {
  const [elapsed, setElapsed] = React.useState(seconds)

  React.useEffect(() => {
    setElapsed(seconds)
  }, [seconds])

  React.useEffect(() => {
    if (!live) return
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [live])

  const { days, hours, minutes, seconds: secs } = splitDuration(elapsed)

  const units = [
    { label: "Day", value: days },
    { label: "Hr", value: hours },
    { label: "Min", value: minutes },
    { label: "Sec", value: secs },
  ]

  const isCompact = size === "sm"

  return (
    <div className="sketch-card inline-flex items-stretch gap-0 p-0">
      {units.map((unit, index) => (
        <div
          key={unit.label}
          className={
            (isCompact
              ? "flex flex-col items-center justify-center gap-0.5 px-2 py-1"
              : "flex flex-col items-center justify-center gap-1 px-4 py-3") +
            (index > 0 ? " border-l-2 border-ink" : "")
          }
        >
          <span
            className={
              "font-heading font-bold tabular-nums text-ink " +
              (isCompact ? "text-sm" : "text-2xl")
            }
          >
            {pad(unit.value)}
          </span>
          <span
            className={
              "font-bold uppercase tracking-wider text-muted " +
              (isCompact ? "text-[8px]" : "text-[10px]")
            }
          >
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  )
}
