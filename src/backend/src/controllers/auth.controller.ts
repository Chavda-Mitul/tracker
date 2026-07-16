import type { FastifyReply, FastifyRequest } from 'fastify';
import { login, signup } from '../services/auth.service';
import type {  LoginInput, SignupInput } from '../types/auth.types';

export async function signupHandler(
  request: FastifyRequest<{ Body: SignupInput }>,
  reply: FastifyReply,
) {
  const user = await signup(request.server.prisma, request.body);
  const token = await reply.server.jwt.sign({ sub: user.id });
  return reply.code(201).send({ token, user });
}

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply,
) {
  const user = await login(request.server.prisma, request.body);
  const token = await reply.server.jwt.sign({ sub: user.id });
  return reply.code(200).send({ token, user });
}