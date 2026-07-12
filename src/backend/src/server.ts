import Fastify from 'fastify';
import { env } from './config/env';

const app = Fastify({
  logger: true,
});

app.get('/health', async () => {
  return { status: 'ok' };
});

app
  .listen({ port: env.port, host: env.host })
  .then((address) => {
    app.log.info(`Server listening at ${address}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
