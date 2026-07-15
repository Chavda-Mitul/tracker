import type { FastifyReply, FastifyRequest } from 'fastify';
import { getMe } from '../services/auth.service';

export async function meHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = await getMe(request.server.prisma, request.user.sub);
  return reply.code(200).send(user);
}
