"use client"

import { Trash2 } from "lucide-react"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SubtaskFormValues } from "@/types/task"

export function SubtaskAccordionList({
  subtasks,
  onRemove,
}: {
  subtasks: SubtaskFormValues[]
  onRemove: (path: number[]) => void
}) {
  if (subtasks.length === 0) return null

  return (
    <Accordion multiple className="flex flex-col gap-2">
      {subtasks.map((subtask, index) => (
        <AccordionItem key={index} value={index}>
          <AccordionHeader>
            <AccordionTrigger>
              {subtask.title || `Subtask ${index + 1}`}
            </AccordionTrigger>
            <button
              type="button"
              onClick={() => onRemove([index])}
              className="sketch-btn bg-paper inline-flex size-9 shrink-0 items-center justify-center text-ink"
            >
              <Trash2 className="size-4" />
            </button>
          </AccordionHeader>
          <AccordionPanel>
            {subtask.description && <p>{subtask.description}</p>}
            <div className="flex flex-wrap gap-3 text-xs">
              <span>Skill: {subtask.skill}</span>
              <span>Priority: {subtask.priority}</span>
              {subtask.dueDate && <span>Due: {subtask.dueDate}</span>}
            </div>
            <SubtaskAccordionList
              subtasks={subtask.subtasks}
              onRemove={(path) => onRemove([index, ...path])}
            />
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
