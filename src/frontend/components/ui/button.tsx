import * as React from "react"

import { cn } from "@/lib/utils"

type ButtonVariant = "default" | "accent" | "ghost"

const variantClasses: Record<ButtonVariant, string> = {
  default: "sketch-btn bg-paper text-ink",
  accent: "sketch-btn bg-accent text-paper",
  ghost:
    "rounded-[10px_16px_10px_16px/14px_10px_16px_10px] border-2 border-transparent text-ink hover:border-ink/30",
}

function Button({
  className,
  variant = "default",
  type = "button",
  ...props
}: React.ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return (
    <button
      type={type}
      data-slot="button"
      className={cn(
        "inline-flex h-11 cursor-pointer items-center justify-center gap-2 px-5 text-sm font-bold tracking-wide disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { Button }
