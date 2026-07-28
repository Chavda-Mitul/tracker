import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate('verifyAppSecret', async (request: FastifyRequest, _reply: FastifyReply) => {
    const secret = request.headers['x-app-secret'];
    if (secret !== env.appSecret) {
      throw new AppError(401, 'Invalid or missing app secret');
    }
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    verifyAppSecret: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
