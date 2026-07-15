import type { FastifyReply, FastifyRequest } from 'fastify';
import { signup } from '../services/auth.service';
import type { SignupInput } from '../types/auth.types';

export async function signupHandler(
  request: FastifyRequest<{ Body: SignupInput }>,
  reply: FastifyReply,
) {
  const user = await signup(request.server.prisma, request.body);
  return reply.code(201).send(user);
}
