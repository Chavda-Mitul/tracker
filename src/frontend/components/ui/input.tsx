import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "sketch-border flex h-11 w-full rounded-[10px_16px_10px_16px/14px_10px_16px_10px] bg-paper px-3.5 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-accent",
        className
      )}
      {...props}
    />
  )
}

export { Input }
