import Fastify, { type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env';
import prismaPlugin from './plugins/prisma';
import jwtPlugin from './plugins/jwt';
import appSecretPlugin from './plugins/appSecret';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import taskRoutes from './routes/task.routes';
import breakRoutes from './routes/break.routes';
import { AppError } from './utils/errors';
import { globalErrorHandler } from './middleware/errorHandler';

export function buildApp() {
  const app = Fastify({logger: true});

  app.setErrorHandler(globalErrorHandler);

  app.register(cors, {
    origin: env.corsOrigin,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE'],
  });

  app.register(prismaPlugin);
  app.register(jwtPlugin);
  app.register(appSecretPlugin);
  app.register(authRoutes, { prefix: '/auth' });
  app.register(userRoutes, { prefix: '/user' });
  app.register(taskRoutes, { prefix: '/tasks' });
  app.register(breakRoutes, { prefix: '/breaks' });

  app.get('/health', async () => { return { status: 'ok' }});

  return app;
}
