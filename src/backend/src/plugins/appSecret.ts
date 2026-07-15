import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

export class InvalidAppSecretError extends AppError {
  constructor() {
    super(401, 'Invalid or missing app secret');
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate('verifyAppSecret', async (request: FastifyRequest, _reply: FastifyReply) => {
    const secret = request.headers['x-app-secret'];
    if (secret !== env.appSecret) {
      throw new InvalidAppSecretError();
    }
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    verifyAppSecret: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
