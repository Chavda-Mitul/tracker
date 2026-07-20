import { buildApp } from './app';
import { env } from './config/env';

const app = buildApp();

app.listen({ port: env.port, host: env.host })
  .then((address) => {
    app.log.info(`Server listening at ${address}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
