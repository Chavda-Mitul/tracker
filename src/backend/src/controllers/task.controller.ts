import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  completeTask,
  createTask,
  deleteTask,
  discardTask,
  getTasks,
  getWorkedSecondsToday,
  reopenTask,
  startTimer,
  stopTimer,
  updateTask,
} from '../services/task.service';
import type {
  CreateTaskInput,
  GetTasksQuery,
  TimeSummaryQuery,
  UpdateTaskInput,
} from '../types/task.types';

export async function createTaskHandler(
  request: FastifyRequest<{ Body: CreateTaskInput }>,
  reply: FastifyReply,
) {
  const task = await createTask(request.server.prisma, request.user.sub, request.body);
  return reply.code(201).send(task);
}

export async function getTasksHandler(
  request: FastifyRequest<{ Querystring: GetTasksQuery }>,
  reply: FastifyReply,
) {
  const result = await getTasks(request.server.prisma, request.user.sub, request.query);
  return reply.code(200).send(result);
}

export async function getTimeSummaryHandler(
  request: FastifyRequest<{ Querystring: TimeSummaryQuery }>,
  reply: FastifyReply,
) {
  const result = await getWorkedSecondsToday(request.server.prisma, request.user.sub, request.query);
  return reply.code(200).send(result);
}

export async function updateTaskHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateTaskInput }>,
  reply: FastifyReply,
) {
  const task = await updateTask(
    request.server.prisma,
    request.user.sub,
    request.params.id,
    request.body,
  );
  return reply.code(200).send(task);
}

export async function deleteTaskHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  await deleteTask(request.server.prisma, request.user.sub, request.params.id);
  return reply.code(204).send();
}

export async function startTimerHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const task = await startTimer(request.server.prisma, request.user.sub, request.params.id);
  return reply.code(200).send(task);
}

export async function stopTimerHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const task = await stopTimer(request.server.prisma, request.user.sub, request.params.id);
  return reply.code(200).send(task);
}

export async function completeTaskHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const task = await completeTask(request.server.prisma, request.user.sub, request.params.id);
  return reply.code(200).send(task);
}

export async function discardTaskHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const task = await discardTask(request.server.prisma, request.user.sub, request.params.id);
  return reply.code(200).send(task);
}

export async function reopenTaskHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const task = await reopenTask(request.server.prisma, request.user.sub, request.params.id);
  return reply.code(200).send(task);
}
