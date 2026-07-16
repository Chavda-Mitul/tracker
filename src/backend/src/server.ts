import Fastify, { type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env';
import prismaPlugin from './plugins/prisma';
import jwtPlugin from './plugins/jwt';
import appSecretPlugin from './plugins/appSecret';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { AppError } from './utils/errors';

const app = Fastify({
  logger: true,
});

app.setErrorHandler<FastifyError | AppError>((err, request, reply) => {
  if (err instanceof AppError) {
    return reply.code(err.statusCode).send({ message: err.message });
  }
  if (err.validation) {
    return reply.code(400).send({ message: err.message });
  }
  request.log.error(err);
  return reply.code(500).send({ message: 'Internal Server Error' });
});



app.register(cors, { origin: env.corsOrigin });
app.register(prismaPlugin);
app.register(jwtPlugin);
app.register(appSecretPlugin);
app.register(authRoutes, { prefix: '/auth' });
app.register(userRoutes, { prefix: '/user' });

app.get('/health', async () => {
  return { status: 'ok' };
});

app.listen({ port: env.port, host: env.host })
  .then((address) => {
    app.log.info(`Server listening at ${address}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
});
