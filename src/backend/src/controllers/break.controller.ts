import type { FastifyReply, FastifyRequest } from 'fastify';
import { getBreaks, startBreak, stopBreak } from '../services/break.service';
import type { CreateBreakInput } from '../types/break.types';

export async function startBreakHandler(
  request: FastifyRequest<{ Body: CreateBreakInput }>,
  reply: FastifyReply,
) {
  const breakRecord = await startBreak(request.server.prisma, request.user.sub, request.body.reason);
  return reply.code(201).send(breakRecord);
}

export async function stopBreakHandler(request: FastifyRequest, reply: FastifyReply) {
  const breakRecord = await stopBreak(request.server.prisma, request.user.sub);
  return reply.code(200).send(breakRecord);
}

export async function getBreaksHandler(request: FastifyRequest, reply: FastifyReply) {
  const breaks = await getBreaks(request.server.prisma, request.user.sub);
  return reply.code(200).send(breaks);
}
