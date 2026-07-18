import type { FastifyInstance } from 'fastify';
import {
  getBreaksHandler,
  startBreakHandler,
  stopBreakHandler,
} from '../controllers/break.controller';
import type { CreateBreakInput } from '../types/break.types';

const breakStartSchema = {
  $id: 'breakStart',
  type: 'object',
  required: ['reason'],
  properties: {
    reason: { type: 'string' },
  },
  additionalProperties: false,
};

export default async function breakRoutes(app: FastifyInstance) {
  app.addSchema(breakStartSchema);

  app.post<{ Body: CreateBreakInput }>(
    '/start',
    { schema: { body: { $ref: 'breakStart#' } }, preHandler: app.authenticate },
    startBreakHandler,
  );

  app.post('/stop', { preHandler: app.authenticate }, stopBreakHandler);

  app.get('/', { preHandler: app.authenticate }, getBreaksHandler);
}
