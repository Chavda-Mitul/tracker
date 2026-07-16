import type { Prisma, PrismaClient } from '../generated/prisma';
import {
  createTask as createTaskInRepo,
  deleteTask as deleteTaskInRepo,
  findChildIds,
  findTaskById,
  findTasksByUser,
  toCreateInput,
  updateTask as updateTaskInRepo,
} from '../repositories/task.repository';
import { AppError } from '../utils/errors';
import { PRIORITIES, SKILLS } from '../constants/task.constants';
import type { CreateTaskInput, UpdateTaskInput } from '../types/task.types';

export class InvalidSkillError extends AppError {
  constructor() {
    super(400, `skill must be one of: ${SKILLS.join(', ')}`);
  }
}

export class InvalidPriorityError extends AppError {
  constructor() {
    super(400, `priority must be one of: ${PRIORITIES.join(', ')}`);
  }
}

export class TaskNotFoundError extends AppError {
  constructor() {
    super(404, 'task not found');
  }
}

export class ForbiddenTaskAccessError extends AppError {
  constructor() {
    super(403, 'not allowed to access this task');
  }
}

export class InvalidSubtaskIdError extends AppError {
  constructor() {
    super(400, 'subtask does not belong to this task');
  }
}

export class MissingSubtaskFieldsError extends AppError {
  constructor() {
    super(400, 'title and skill are required for new subtasks');
  }
}

function validate(input: CreateTaskInput) {
  if (!SKILLS.includes(input.skill as (typeof SKILLS)[number])) {
    throw new InvalidSkillError();
  }
  if (input.priority && !PRIORITIES.includes(input.priority as (typeof PRIORITIES)[number])) {
    throw new InvalidPriorityError();
  }
  input.subtasks?.forEach(validate);
}

function validateUpdate(input: UpdateTaskInput) {
  if (input.skill && !SKILLS.includes(input.skill as (typeof SKILLS)[number])) {
    throw new InvalidSkillError();
  }
  if (input.priority && !PRIORITIES.includes(input.priority as (typeof PRIORITIES)[number])) {
    throw new InvalidPriorityError();
  }
  input.subtasks?.forEach((subtask) => {
    if (!subtask.id && (!subtask.title || !subtask.skill)) {
      throw new MissingSubtaskFieldsError();
    }
    validateUpdate(subtask);
  });
}

export async function createTask(prisma: PrismaClient, userId: string, input: CreateTaskInput) {
  validate(input);
  return createTaskInRepo(prisma, userId, input);
}

export async function getTasks(prisma: PrismaClient, userId: string) {
  return findTasksByUser(prisma, userId);
}

async function getOwnedTask(prisma: PrismaClient, userId: string, taskId: string) {
  const task = await findTaskById(prisma, taskId);
  if (!task) {
    throw new TaskNotFoundError();
  }
  if (task.userId !== userId) {
    throw new ForbiddenTaskAccessError();
  }
  return task;
}

// ponytail: recurses to the same fixed depth as findTasksByUser's subtasksInclude
async function buildUpdateData(
  prisma: PrismaClient,
  userId: string,
  input: UpdateTaskInput,
  existingChildIds: string[],
): Promise<Prisma.TaskUpdateInput> {
  const base: Prisma.TaskUpdateInput = {
    title: input.title,
    description: input.description,
    skill: input.skill,
    priority: input.priority,
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
  };

  if (input.subtasks === undefined) {
    return base;
  }

  const toCreate = input.subtasks.filter((subtask) => !subtask.id);
  const toKeep = input.subtasks.filter(
    (subtask): subtask is UpdateTaskInput & { id: string } => !!subtask.id,
  );

  toKeep.forEach((subtask) => {
    if (!existingChildIds.includes(subtask.id)) {
      throw new InvalidSubtaskIdError();
    }
  });

  const keepIds = toKeep.map((subtask) => subtask.id);
  const deleteIds = existingChildIds.filter((id) => !keepIds.includes(id));

  const updateEntries = await Promise.all(
    toKeep.map(async (subtask) => ({
      where: { id: subtask.id },
      data: await buildUpdateData(
        prisma,
        userId,
        subtask,
        await findChildIds(prisma, subtask.id),
      ),
    })),
  );

  return {
    ...base,
    subtasks: {
      create: toCreate.map((subtask) => toCreateInput(userId, subtask as CreateTaskInput)),
      update: updateEntries,
      delete: deleteIds.map((id) => ({ id })),
    },
  };
}

export async function updateTask(
  prisma: PrismaClient,
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
) {
  await getOwnedTask(prisma, userId, taskId);
  validateUpdate(input);
  const childIds = await findChildIds(prisma, taskId);
  const data = await buildUpdateData(prisma, userId, input, childIds);
  return updateTaskInRepo(prisma, taskId, data);
}

export async function deleteTask(prisma: PrismaClient, userId: string, taskId: string) {
  await getOwnedTask(prisma, userId, taskId);
  return deleteTaskInRepo(prisma, taskId);
}
