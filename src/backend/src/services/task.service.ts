import type { Prisma, PrismaClient } from '../generated/prisma';
import {
  createTask as createTaskInRepo,
  deleteTask as deleteTaskInRepo,
  findChildIds,
  findRunningTaskByUser,
  findSessionsOverlapping,
  findTaskById,
  findTasksByUser,
  setTaskStatus,
  startTask,
  stopTask,
  toCreateInput,
  updateTask as updateTaskInRepo,
} from '../repositories/task.repository';
import { AppError } from '../utils/errors';
import { PRIORITIES, SKILLS } from '../constants/task.constants';
import type {
  CreateTaskInput,
  GetTasksQuery,
  TimeSummaryQuery,
  UpdateTaskInput,
} from '../types/task.types';

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

export class TaskNotRunningError extends AppError {
  constructor() {
    super(409, 'task is not running');
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

function buildTasksWhere(query: GetTasksQuery): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = {};
  if (query.status) {
    where.status = query.status;
  }
  if (query.from || query.to) {
    where.completedAt = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {}),
    };
  }
  return where;
}

function sumElapsedSeconds(tasks: { elapsedSeconds: number; subtasks: unknown[] }[]): number {
  return tasks.reduce(
    (sum, task) =>
      sum +
      task.elapsedSeconds +
      sumElapsedSeconds(task.subtasks as { elapsedSeconds: number; subtasks: unknown[] }[]),
    0,
  );
}

export async function getTasks(prisma: PrismaClient, userId: string, query: GetTasksQuery = {}) {
  const tasks = await findTasksByUser(prisma, userId, buildTasksWhere(query));
  return { tasks, totalElapsedSeconds: sumElapsedSeconds(tasks) };
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

function accumulatedElapsedSeconds(
  elapsedSeconds: number,
  startedAt: Date | null,
  now: Date,
): number {
  if (!startedAt) {
    return elapsedSeconds;
  }
  return elapsedSeconds + Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000));
}

export async function startTimer(prisma: PrismaClient, userId: string, taskId: string) {
  const task = await getOwnedTask(prisma, userId, taskId);
  if (task.isRunning) {
    return startTask(prisma, taskId, task.startedAt ?? new Date());
  }

  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const runningTask = await findRunningTaskByUser(tx as PrismaClient, userId);
    if (runningTask && runningTask.id !== taskId) {
      await stopTask(
        tx as PrismaClient,
        runningTask.id,
        accumulatedElapsedSeconds(runningTask.elapsedSeconds, runningTask.startedAt, now),
        now,
      );
    }
    return startTask(tx as PrismaClient, taskId, now);
  });
}

export async function stopTimer(prisma: PrismaClient, userId: string, taskId: string) {
  const task = await getOwnedTask(prisma, userId, taskId);
  if (!task.isRunning) {
    throw new TaskNotRunningError();
  }
  const now = new Date();
  const elapsedSeconds = accumulatedElapsedSeconds(task.elapsedSeconds, task.startedAt, now);
  return stopTask(prisma, taskId, elapsedSeconds, now);
}

async function stopIfRunning(prisma: PrismaClient, task: { id: string; isRunning: boolean; elapsedSeconds: number; startedAt: Date | null }) {
  if (!task.isRunning) return;
  const now = new Date();
  const elapsedSeconds = accumulatedElapsedSeconds(task.elapsedSeconds, task.startedAt, now);
  await stopTask(prisma, task.id, elapsedSeconds, now);
}

export async function getWorkedSecondsToday(
  prisma: PrismaClient,
  userId: string,
  query: TimeSummaryQuery,
) {
  const now = new Date();
  const from = new Date(query.from);
  const to = new Date(query.to);
  const sessions = await findSessionsOverlapping(prisma, userId, from, to);
  const workedSeconds = sessions.reduce((sum, session) => {
    const start = Math.max(session.startedAt.getTime(), from.getTime());
    const end = Math.min((session.endedAt ?? now).getTime(), to.getTime());
    return sum + Math.max(0, Math.floor((end - start) / 1000));
  }, 0);
  return { workedSeconds, asOf: now.toISOString() };
}

export async function completeTask(prisma: PrismaClient, userId: string, taskId: string) {
  const task = await getOwnedTask(prisma, userId, taskId);
  await stopIfRunning(prisma, task);
  return setTaskStatus(prisma, taskId, 'COMPLETED', new Date());
}

export async function discardTask(prisma: PrismaClient, userId: string, taskId: string) {
  const task = await getOwnedTask(prisma, userId, taskId);
  await stopIfRunning(prisma, task);
  return setTaskStatus(prisma, taskId, 'DISCARDED', null);
}

export async function reopenTask(prisma: PrismaClient, userId: string, taskId: string) {
  await getOwnedTask(prisma, userId, taskId);
  return setTaskStatus(prisma, taskId, 'PENDING', null);
}
