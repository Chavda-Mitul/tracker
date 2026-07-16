import type { FastifyReply, FastifyRequest } from 'fastify';
import { createTask, deleteTask, getTasks, updateTask } from '../services/task.service';
import type { CreateTaskInput, UpdateTaskInput } from '../types/task.types';

export async function createTaskHandler(
  request: FastifyRequest<{ Body: CreateTaskInput }>,
  reply: FastifyReply,
) {
  const task = await createTask(request.server.prisma, request.user.sub, request.body);
  return reply.code(201).send(task);
}

export async function getTasksHandler(request: FastifyRequest, reply: FastifyReply) {
  const tasks = await getTasks(request.server.prisma, request.user.sub);
  return reply.code(200).send(tasks);
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
