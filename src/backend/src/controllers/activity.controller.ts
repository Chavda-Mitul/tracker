import type { FastifyReply, FastifyRequest } from 'fastify';
import { getActivityHeatmap } from '../services/activity.service';
import type { ActivityHeatmapQuery } from '../types/activity.types';

export async function getActivityHeatmapHandler(
  request: FastifyRequest<{ Querystring: ActivityHeatmapQuery }>,
  reply: FastifyReply,
) {
  const result = await getActivityHeatmap(request.server.prisma, request.user.sub, request.query);
  return reply.code(200).send(result);
}
