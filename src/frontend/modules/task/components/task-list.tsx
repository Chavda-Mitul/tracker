"use client"

import { useState } from "react"
import { Ban, Check, MoreVertical, Pencil, Play, RotateCcw, Square, Trash2 } from "lucide-react"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Clock } from "@/components/common/clock"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { TaskFormValues, TaskListItem } from "@/types/task"
import { cn } from "@/lib/utils"
import { EditTaskDrawer } from "./edit-task-drawer"

type ActiveAction = "complete" | "edit" | "discard" | "delete" | "reopen" | null

export function TaskList({
  tasks,
  onToggleTimer,
  onUpdateTask,
  onDeleteTask,
  onCompleteTask,
  onDiscardTask,
  onReopenTask,
}: {
  tasks: TaskListItem[]
  onToggleTimer: (taskId: string) => void
  onUpdateTask: (values: TaskFormValues) => void
  onDeleteTask: (id: string) => void
  onCompleteTask: (id: string) => void
  onDiscardTask: (id: string) => void
  onReopenTask: (id: string) => void
}) {
  if (tasks.length === 0) return null

  return (
    <Accordion multiple className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onToggleTimer={onToggleTimer}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onCompleteTask={onCompleteTask}
          onDiscardTask={onDiscardTask}
          onReopenTask={onReopenTask}
        />
      ))}
    </Accordion>
  )
}

function TaskRow({
  task,
  onToggleTimer,
  onUpdateTask,
  onDeleteTask,
  onCompleteTask,
  onDiscardTask,
  onReopenTask,
}: {
  task: TaskListItem
  onToggleTimer: (taskId: string) => void
  onUpdateTask: (values: TaskFormValues) => void
  onDeleteTask: (id: string) => void
  onCompleteTask: (id: string) => void
  onDiscardTask: (id: string) => void
  onReopenTask: (id: string) => void
}) {
  const [activeAction, setActiveAction] = useState<ActiveAction>(null)
  const isPending = task.status === "PENDING"
  const isCompleted = task.status === "COMPLETED"
  const isDiscarded = task.status === "DISCARDED"

  return (
    <AccordionItem value={task.id}>
      <AccordionHeader>
        {isCompleted && (
          <ConfirmDialog
            trigger={<Check className="size-3.5" />}
            triggerClassName="size-7 rounded-full !border-accent bg-accent text-paper hover:!border-accent hover:bg-accent"
            title="Reopen this quest?"
            description={`"${task.title}" will move back to your pending list.`}
            confirmLabel="Reopen"
            onConfirm={() => onReopenTask(task.id)}
            open={activeAction === "reopen"}
            onOpenChange={(open) => setActiveAction(open ? "reopen" : null)}
          />
        )}
        {isPending && (
          <ConfirmDialog
            trigger={<Check className="size-3.5" />}
            triggerClassName="size-7 rounded-full !p-0 hover:!border-accent hover:bg-accent hover:text-paper"
            title="Mark this quest complete?"
            description={`"${task.title}" will move out of your pending list.`}
            confirmLabel="Complete"
            onConfirm={() => onCompleteTask(task.id)}
            open={activeAction === "complete"}
            onOpenChange={(open) => setActiveAction(open ? "complete" : null)}
          />
        )}
        <AccordionTrigger
          className={cn(!isPending && "text-ink/50 line-through")}
        >
          {task.title}
        </AccordionTrigger>
        {isPending && (
          <Button
            variant="accent"
            className="h-9 shrink-0 px-4 text-xs text-ink"
            onClick={(event) => {
              event.stopPropagation()
              onToggleTimer(task.id)
            }}
          >
            {task.isRunning ? (
              <Square className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
            {task.isRunning ? "Stop" : "Start"}
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(event) => event.stopPropagation()}
            className="sketch-btn bg-paper inline-flex size-9 shrink-0 items-center justify-center text-ink"
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent onClick={(event) => event.stopPropagation()}>
            {isPending && (
              <DropdownMenuItem onClick={() => setActiveAction("edit")}>
                <Pencil className="size-3.5" />
                Edit
              </DropdownMenuItem>
            )}
            {isPending && (
              <DropdownMenuItem onClick={() => setActiveAction("discard")}>
                <Ban className="size-3.5" />
                Discard
              </DropdownMenuItem>
            )}
            {isDiscarded && (
              <DropdownMenuItem onClick={() => onReopenTask(task.id)}>
                <RotateCcw className="size-3.5" />
                Restore
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setActiveAction("delete")}
            >
              <Trash2 className="size-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {isPending && (
          <EditTaskDrawer
            task={task}
            onUpdateTask={onUpdateTask}
            open={activeAction === "edit"}
            onOpenChange={(open) => setActiveAction(open ? "edit" : null)}
          />
        )}
        {isPending && (
          <ConfirmDialog
            title="Discard this quest?"
            description={`"${task.title}" will be moved to your discarded list.`}
            confirmLabel="Discard"
            onConfirm={() => onDiscardTask(task.id)}
            open={activeAction === "discard"}
            onOpenChange={(open) => setActiveAction(open ? "discard" : null)}
          />
        )}
        <ConfirmDialog
          title="Delete this quest?"
          description={`"${task.title}" and any subtasks under it will be permanently removed.`}
          confirmLabel="Delete"
          onConfirm={() => onDeleteTask(task.id)}
          open={activeAction === "delete"}
          onOpenChange={(open) => setActiveAction(open ? "delete" : null)}
        />
      </AccordionHeader>
      <AccordionPanel>
        {task.description && <p>{task.description}</p>}
        <div className="flex flex-wrap gap-3 text-xs">
          {task.skill && <span>Skill: {task.skill}</span>}
          {task.priority && <span>Priority: {task.priority}</span>}
          <span>Status: {task.status}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            {task.isRunning ? "Time Ongoing" : "Time Taken"}
          </span>
          <Clock seconds={task.elapsedSeconds ?? 0} live={task.isRunning} />
        </div>
        <TaskList
          tasks={task.subtasks}
          onToggleTimer={onToggleTimer}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onCompleteTask={onCompleteTask}
          onDiscardTask={onDiscardTask}
          onReopenTask={onReopenTask}
        />
      </AccordionPanel>
    </AccordionItem>
  )
}
