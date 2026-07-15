import type { FastifyInstance } from 'fastify';
import { signupHandler } from '../controllers/auth.controller';

const signupSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
      name: { type: 'string' },
    },
    additionalProperties: false,
  },
};

export default async function authRoutes(app: FastifyInstance) {
  app.post('/signup', { schema: signupSchema }, signupHandler);
}
