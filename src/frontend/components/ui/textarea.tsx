import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "sketch-border flex min-h-24 w-full resize-none rounded-[10px_16px_10px_16px/14px_10px_16px_10px] bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-accent",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
