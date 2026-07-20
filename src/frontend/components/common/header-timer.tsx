"use client"

import * as React from "react"
import { Coffee, Square } from "lucide-react"

import { Clock } from "@/components/common/clock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTimer } from "@/context/timer-context"

export function HeaderTimer() {
  const {
    totalWorkSeconds,
    isWorking,
    isOnBreak,
    breakReason,
    totalBreakSeconds,
    startBreak,
    stopBreak,
  } = useTimer()

  const [reasonDraft, setReasonDraft] = React.useState("")
  const [askingReason, setAskingReason] = React.useState(false)

  const handleStartBreak = () => {
    if (!reasonDraft.trim()) return
    startBreak(reasonDraft.trim())
    setReasonDraft("")
    setAskingReason(false)
  }

  return (
    <div className="ml-auto flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="hidden text-[10px] font-bold uppercase tracking-wider text-muted sm:inline">
          Worked
        </span>
        <Clock seconds={totalWorkSeconds} live={isWorking} size="sm" />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="hidden text-[10px] font-bold uppercase tracking-wider text-muted sm:inline">
          Break
        </span>
        <Clock seconds={totalBreakSeconds} live={isOnBreak} size="sm" />
      </div>

      {isOnBreak ? (
        <div className="flex items-center gap-2">
          <span className="sketch-border rounded-[10px_16px_10px_16px/14px_10px_16px_10px] bg-paper px-2.5 py-1 text-xs text-ink">
            {breakReason}
          </span>
          <Button
            variant="accent"
            className="h-8 px-3 text-xs"
            onClick={stopBreak}
          >
            <Square className="size-3" />
            End Break
          </Button>
        </div>
      ) : askingReason ? (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            placeholder="Reason for break..."
            className="h-8 w-40 px-2.5 py-1 text-xs"
            value={reasonDraft}
            onChange={(event) => setReasonDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleStartBreak()
              if (event.key === "Escape") setAskingReason(false)
            }}
          />
          <Button className="h-8 px-3 text-xs" onClick={handleStartBreak}>
            Go
          </Button>
        </div>
      ) : (
        <Button
          className="h-9 px-3 text-xs"
          onClick={() => setAskingReason(true)}
        >
          <Coffee className="size-3.5" />
          Take a Break
        </Button>
      )}
    </div>
  )
}
