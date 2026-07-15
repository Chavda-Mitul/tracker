import type { FastifyInstance } from 'fastify';
import { meHandler } from '../controllers/user.controller';

export default async function userRoutes(app: FastifyInstance) {
  app.get('/me', { preHandler: app.authenticate }, meHandler);
}
