"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { CalendarDays } from "lucide-react"

import { cn } from "@/lib/utils"
import { MONTH_NAMES } from "@/lib/date"
import { Calendar, CALENDAR_WIDTH } from "@/components/ui/calendar"

const VIEWPORT_MARGIN = 16

function formatDisplayDate(value?: string) {
  if (!value) return ""
  const [y, m, d] = value.split("-").map(Number)
  if (!y || !m || !d) return ""
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}, ${y}`
}

function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  className,
}: {
  id?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [coords, setCoords] = React.useState({ top: 0, left: 0 })
  const [mounted, setMounted] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => setMounted(true), [])

  const updateCoords = React.useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const left = Math.min(
      Math.max(rect.left, VIEWPORT_MARGIN),
      window.innerWidth - CALENDAR_WIDTH - VIEWPORT_MARGIN
    )
    setCoords({ top: rect.bottom + 8, left })
  }, [])

  React.useEffect(() => {
    if (!open) return

    updateCoords()

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        !triggerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    window.addEventListener("resize", updateCoords)
    window.addEventListener("scroll", updateCoords, true)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("resize", updateCoords)
      window.removeEventListener("scroll", updateCoords, true)
    }
  }, [open, updateCoords])

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "sketch-border flex h-11 w-full items-center justify-between gap-2 rounded-[10px_16px_10px_16px/14px_10px_16px_10px] bg-paper px-3.5 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          !value && "text-muted",
          className
        )}
      >
        <span>{value ? formatDisplayDate(value) : placeholder}</span>
        <CalendarDays className="size-4 shrink-0 text-ink/70" />
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            ref={panelRef}
            style={{ top: coords.top, left: coords.left, width: CALENDAR_WIDTH }}
            className="sketch-card fixed z-50 p-3"
          >
            <Calendar
              value={value}
              onChange={(next) => {
                onChange?.(next)
                setOpen(false)
              }}
            />
          </div>,
          document.body
        )}
    </>
  )
}

export { DatePicker }
