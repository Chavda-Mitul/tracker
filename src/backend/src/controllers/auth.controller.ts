import type { FastifyReply, FastifyRequest } from 'fastify';
import { signin, signup } from '../services/auth.service';
import type { SigninInput, SignupInput } from '../types/auth.types';

export async function signupHandler(
  request: FastifyRequest<{ Body: SignupInput }>,
  reply: FastifyReply,
) {
  const user = await signup(request.server.prisma, request.body);
  const token = await reply.server.jwt.sign({ sub: user.id });
  return reply.code(201).send({ token, user });
}

export async function signinHandler(
  request: FastifyRequest<{ Body: SigninInput }>,
  reply: FastifyReply,
) {
  const user = await signin(request.server.prisma, request.body);
  const token = await reply.server.jwt.sign({ sub: user.id });
  return reply.code(200).send({ token, user });
}