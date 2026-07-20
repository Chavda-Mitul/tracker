"use client"

import React from "react"
import { Plus } from "lucide-react"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { TaskFormValues } from "@/types/task"
import { TaskForm } from "./task-form"

export function CreateTaskDrawer({
  onCreateTask,
}: {
  onCreateTask: (task: TaskFormValues) => void
}) {
  const [open, setOpen] = React.useState(false)

  const handleSubmit = (values: TaskFormValues) => {
    onCreateTask(values)
    setOpen(false)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
      <DrawerTrigger className="sketch-btn bg-paper inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-ink">
        <Plus className="size-4" />
        New Quest
      </DrawerTrigger>
      <DrawerContent className="sketch-card !rounded-none border-l-[2.5px]">
        <DrawerHeader>
          <DrawerTitle>New Quest</DrawerTitle>
          <p className="text-sm text-muted">
            Log a task to start earning XP toward your skills.
          </p>
        </DrawerHeader>
        <TaskForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  )
}
