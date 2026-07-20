import * as React from "react"
import { UseFormRegisterReturn } from "react-hook-form"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function FormField({
  id,
  label,
  error,
  className,
  children,
}: {
  id?: string
  label?: React.ReactNode
  error?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      {children}
      {error && <p className="text-xs font-medium text-accent">{error}</p>}
    </div>
  )
}

type FieldProps = {
  label: React.ReactNode
  error?: React.ReactNode
  register: UseFormRegisterReturn
} & Omit<React.ComponentProps<typeof Input>, "name">

function Field({ label, error, register, id, className, ...inputProps }: FieldProps) {
  return (
    <FormField id={id} label={label} error={error}>
      <Input
        id={id}
        aria-invalid={!!error}
        className={className}
        {...register}
        {...inputProps}
      />
    </FormField>
  )
}

export { FormField, Field }
