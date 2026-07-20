"use client"

import React from "react"
import { Pencil } from "lucide-react"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { TaskFormValues, TaskListItem } from "@/types/task"
import { TaskForm } from "./task-form"

export function EditTaskDrawer({
  task,
  onUpdateTask,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: {
  task: TaskListItem
  onUpdateTask: (values: TaskFormValues) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = openProp ?? internalOpen
  const setOpen = onOpenChangeProp ?? setInternalOpen

  const handleSubmit = (values: TaskFormValues) => {
    onUpdateTask(values)
    setOpen(false)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
      {openProp === undefined && (
        <DrawerTrigger
          onClick={(event) => event.stopPropagation()}
          className="sketch-btn bg-paper inline-flex size-9 shrink-0 items-center justify-center text-ink"
        >
          <Pencil className="size-4" />
        </DrawerTrigger>
      )}
      <DrawerContent className="sketch-card !rounded-none border-l-[2.5px]">
        <DrawerHeader>
          <DrawerTitle>Edit Quest</DrawerTitle>
        </DrawerHeader>
        <TaskForm
          submitLabel="Save Changes"
          defaultValues={task as TaskFormValues}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DrawerContent>
    </Drawer>
  )
}
