import type { FastifyInstance } from 'fastify';
import { getActivityHeatmapHandler } from '../controllers/activity.controller';
import type { ActivityHeatmapQuery } from '../types/activity.types';

export default async function activityRoutes(app: FastifyInstance) {
  app.get<{ Querystring: ActivityHeatmapQuery }>(
    '/heatmap',
    { schema: { querystring: activityHeatmapQuerySchema }, preHandler: app.authenticate },
    getActivityHeatmapHandler,
  );
}

const activityHeatmapQuerySchema = {
  type: 'object',
  required: ['from', 'to'],
  properties: {
    from: { type: 'string' },
    to: { type: 'string' },
  },
};
