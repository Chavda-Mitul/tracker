import type { Prisma, PrismaClient } from '../generated/prisma';
import type { CreateTaskInput } from '../types/task.types';

export function toCreateInput(
  userId: string,
  input: CreateTaskInput,
): Prisma.TaskCreateWithoutParentInput {
  return {
    title: input.title,
    description: input.description,
    skill: input.skill,
    priority: input.priority,
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    user: { connect: { id: userId } },
    subtasks: input.subtasks?.length
      ? { create: input.subtasks.map((subtask) => toCreateInput(userId, subtask)) }
      : undefined,
  };
}

export function createTask(prisma: PrismaClient, userId: string, input: CreateTaskInput) {
  return prisma.task.create({
    data: toCreateInput(userId, input),
    include: { subtasks: true },
  });
}

// ponytail: fixed nesting depth, switch to a recursive CTE if deeper trees are needed
const subtasksInclude = {
  subtasks: { include: { subtasks: { include: { subtasks: { include: { subtasks: true } } } } } },
};

export function findTasksByUser(
  prisma: PrismaClient,
  userId: string,
  where?: Prisma.TaskWhereInput,
) {
  return prisma.task.findMany({
    where: { userId, parentId: null, ...where },
    include: subtasksInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export function findTaskById(prisma: PrismaClient, id: string) {
  return prisma.task.findUnique({ where: { id } });
}

export async function findChildIds(prisma: PrismaClient, parentId: string) {
  const children = await prisma.task.findMany({ where: { parentId }, select: { id: true } });
  return children.map((child) => child.id);
}

export function updateTask(prisma: PrismaClient, id: string, data: Prisma.TaskUpdateInput) {
  return prisma.task.update({
    where: { id },
    data,
    include: { subtasks: true },
  });
}

export function deleteTask(prisma: PrismaClient, id: string) {
  return prisma.task.delete({ where: { id } });
}

export function findRunningTaskByUser(prisma: PrismaClient, userId: string) {
  return prisma.task.findFirst({ where: { userId, isRunning: true } });
}

export async function startTask(prisma: PrismaClient, taskId: string, now: Date) {
  await prisma.taskSession.create({ data: { taskId, startedAt: now } });
  return prisma.task.update({
    where: { id: taskId },
    data: { isRunning: true, startedAt: now },
    include: { subtasks: true },
  });
}

export async function stopTask(
  prisma: PrismaClient,
  taskId: string,
  elapsedSeconds: number,
  endedAt: Date,
) {
  await prisma.taskSession.updateMany({
    where: { taskId, endedAt: null },
    data: { endedAt },
  });
  return prisma.task.update({
    where: { id: taskId },
    data: { isRunning: false, startedAt: null, elapsedSeconds },
    include: { subtasks: true },
  });
}

export function findSessionsOverlapping(
  prisma: PrismaClient,
  userId: string,
  from: Date,
  to: Date,
) {
  return prisma.taskSession.findMany({
    where: {
      task: { userId },
      startedAt: { lt: to },
      OR: [{ endedAt: null }, { endedAt: { gt: from } }],
    },
  });
}

export function setTaskStatus(
  prisma: PrismaClient,
  taskId: string,
  status: 'PENDING' | 'COMPLETED' | 'DISCARDED',
  completedAt: Date | null,
) {
  return prisma.task.update({
    where: { id: taskId },
    data: { status, completedAt },
    include: { subtasks: true },
  });
}
