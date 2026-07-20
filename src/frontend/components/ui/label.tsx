import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "sketch-title text-sm font-bold tracking-wide text-ink",
        className
      )}
      {...props}
    />
  )
}

export { Label }
