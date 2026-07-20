"use client"

import React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormField } from "@/components/ui/form-field"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { SubtaskAccordionList } from "@/modules/task/components/subtask-accordion-list"
import { removeSubtaskAtPath } from "@/modules/task/utils/subtask"
import { TaskFormValues } from "@/types/task"
import { PRIORITIES, SKILLS } from "@/constants/task"
import { cn } from "@/lib/utils"

export function TaskForm({
  submitLabel = "Create Quest",
  defaultValues,
  onSubmit,
  onCancel,
}: {
  submitLabel?: string
  defaultValues?: TaskFormValues
  onSubmit?: (values: TaskFormValues) => void
  onCancel?: () => void
}) {
  const [subtaskDrawerOpen, setSubtaskDrawerOpen] = React.useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<TaskFormValues>({
    defaultValues: defaultValues ?? {
      id: "",
      title: "",
      description: "",
      skill: SKILLS[0],
      priority: "Medium",
      dueDate: "",
      subtasks: [],
    },
  })

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "subtasks",
  });

  const priority = watch("priority")
  const dueDate = watch("dueDate")

  const handleFormSubmit = (values: TaskFormValues) => {
    onSubmit?.(values);
  }

  const handleSubtaskSubmit = (values: TaskFormValues) => {
    append(values);
    setSubtaskDrawerOpen(false);
  }

  const onFormSubmit = (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleSubmit(handleFormSubmit)(e)
  }

  const handleRemoveSubtask = (path: number[]) => {
    const [index, ...rest] = path
    if (rest.length === 0) {
      remove(index)
      return
    }
    const current = getValues(`subtasks.${index}`)
    update(index, {
      ...current,
      subtasks: removeSubtaskAtPath(current.subtasks, rest),
    })
  }

  return (
    <form
      onSubmit={onFormSubmit}
      className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4"
    >
      <FormField
        id="title"
        label="Task title"
        error={errors.title && "Give your quest a title."}
      >
        <Input
          id="title"
          placeholder="e.g. Build the login page"
          aria-invalid={!!errors.title}
          {...register("title", { required: true })}
        />
      </FormField>

      <FormField id="description" label="Description">
        <Textarea
          id="description"
          placeholder="Add any notes or details about this task..."
          {...register("description")}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="skill" label="Skill category">
          <Select id="skill" {...register("skill")}>
            {SKILLS.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="dueDate" label="Due date">
          <DatePicker
            id="dueDate"
            value={dueDate}
            onChange={(value) => setValue("dueDate", value)}
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Priority</Label>
        <div className="flex gap-2">
          {PRIORITIES.map((level) => (
            <Button
              key={level}
              type="button"
              onClick={() => setValue("priority", level)}
              className={cnPriority(priority === level)}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Subtasks</Label>
          <Drawer
            open={subtaskDrawerOpen}
            onOpenChange={setSubtaskDrawerOpen}
            swipeDirection="right"
          >
            <DrawerTrigger className="inline-flex h-8 items-center gap-2 rounded-[10px_16px_10px_16px/14px_10px_16px_10px] border-2 border-transparent px-3 text-xs font-bold tracking-wide text-ink hover:border-ink/30">
              <Plus className="size-3.5" />
              Add subtask
            </DrawerTrigger>
            <DrawerContent className="sketch-card !rounded-none border-l-[2.5px]">
              <DrawerHeader>
                <DrawerTitle>Add Subtask</DrawerTitle>
              </DrawerHeader>
              <TaskForm
                submitLabel="Add Subtask"
                onSubmit={handleSubtaskSubmit}
                onCancel={() => setSubtaskDrawerOpen(false)}
              />
            </DrawerContent>
          </Drawer>
        </div>

        {fields.length === 0 && (
          <p className="sketch-border rounded-[10px_16px_10px_16px/14px_10px_16px_10px] border-dashed bg-paper px-3.5 py-3 text-xs text-muted">
            No subtasks yet. Break this quest down into smaller steps.
          </p>
        )}

        <SubtaskAccordionList
          subtasks={watch("subtasks")}
          onRemove={handleRemoveSubtask}
        />
      </div>

      <div className="mt-2 flex items-center justify-end gap-3">
        <Button type="button" onClick={onCancel} className="py-2.5">
          Cancel
        </Button>

        <Button type="submit" variant="accent" className="py-2.5 text-ink">
          {submitLabel}
        </Button>

      </div>
    </form>
  )
}

function cnPriority(active: boolean) {
  return cn(
    "sketch-btn flex-1 py-2 text-sm font-bold",
    active ? "bg-slate-100 text-ink" : "bg-paper text-ink/70"
  )
}
