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
import activityRoutes from './routes/activity.routes';
import { AppError } from './utils/errors';
import { globalErrorHandler } from './middleware/errorHandler';

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.nodeEnv === 'production' ? 'info' : 'debug',
      transport: env.nodeEnv === 'production' || process.env.VERCEL
        ? undefined
        : { target: 'pino-pretty' },
    },
  });

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
  app.register(activityRoutes, { prefix: '/activity' });

  app.get('/health', async () => { return { status: 'ok' }});

  return app;
}
