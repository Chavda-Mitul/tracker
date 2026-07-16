import type { FastifyInstance } from 'fastify';
import {
  createTaskHandler,
  deleteTaskHandler,
  getTasksHandler,
  updateTaskHandler,
} from '../controllers/task.controller';
import type { CreateTaskInput, UpdateTaskInput } from '../types/task.types';

const taskSchema = {
  $id: 'task',
  type: 'object',
  required: ['title', 'skill'],
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    skill: { type: 'string' },
    priority: { type: 'string' },
    dueDate: { type: 'string' },
    subtasks: { type: 'array', items: { $ref: 'task#' } },
  },
  additionalProperties: false,
};

const taskUpdateSchema = {
  $id: 'taskUpdate',
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    skill: { type: 'string' },
    priority: { type: 'string' },
    dueDate: { type: 'string' },
    subtasks: { type: 'array', items: { $ref: 'taskUpdate#' } },
  },
  additionalProperties: false,
};

const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string' } },
};

export default async function taskRoutes(app: FastifyInstance) {
  app.addSchema(taskSchema);
  app.addSchema(taskUpdateSchema);

  app.post<{ Body: CreateTaskInput }>(
    '/',
    { schema: { body: { $ref: 'task#' } }, preHandler: app.authenticate },
    createTaskHandler,
  );

  app.get('/', { preHandler: app.authenticate }, getTasksHandler);

  app.patch<{ Params: { id: string }; Body: UpdateTaskInput }>(
    '/:id',
    {
      schema: { params: idParamSchema, body: { $ref: 'taskUpdate#' } },
      preHandler: app.authenticate,
    },
    updateTaskHandler,
  );

  app.delete<{ Params: { id: string } }>(
    '/:id',
    { schema: { params: idParamSchema }, preHandler: app.authenticate },
    deleteTaskHandler,
  );
}
