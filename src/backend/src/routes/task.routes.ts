import type { FastifyInstance } from 'fastify';
import {
  completeTaskHandler,
  createTaskHandler,
  deleteTaskHandler,
  discardTaskHandler,
  getTasksHandler,
  reopenTaskHandler,
  startTimerHandler,
  stopTimerHandler,
  updateTaskHandler,
} from '../controllers/task.controller';
import type { CreateTaskInput, GetTasksQuery, UpdateTaskInput } from '../types/task.types';

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

const getTasksQuerySchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'DISCARDED'] },
    from: { type: 'string' },
    to: { type: 'string' },
  },
};

export default async function taskRoutes(app: FastifyInstance) {
  app.addSchema(taskSchema);
  app.addSchema(taskUpdateSchema);

  app.post<{ Body: CreateTaskInput }>(
    '/',
    { schema: { body: { $ref: 'task#' } }, preHandler: app.authenticate },
    createTaskHandler,
  );

  app.get<{ Querystring: GetTasksQuery }>(
    '/',
    { schema: { querystring: getTasksQuerySchema }, preHandler: app.authenticate },
    getTasksHandler,
  );

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

  app.post<{ Params: { id: string } }>(
    '/:id/start',
    { schema: { params: idParamSchema }, preHandler: app.authenticate },
    startTimerHandler,
  );

  app.post<{ Params: { id: string } }>(
    '/:id/stop',
    { schema: { params: idParamSchema }, preHandler: app.authenticate },
    stopTimerHandler,
  );

  app.post<{ Params: { id: string } }>(
    '/:id/complete',
    { schema: { params: idParamSchema }, preHandler: app.authenticate },
    completeTaskHandler,
  );

  app.post<{ Params: { id: string } }>(
    '/:id/discard',
    { schema: { params: idParamSchema }, preHandler: app.authenticate },
    discardTaskHandler,
  );

  app.post<{ Params: { id: string } }>(
    '/:id/reopen',
    { schema: { params: idParamSchema }, preHandler: app.authenticate },
    reopenTaskHandler,
  );
}
