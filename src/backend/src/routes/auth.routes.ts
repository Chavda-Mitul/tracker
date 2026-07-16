import type { FastifyInstance } from 'fastify';
import { loginHandler, signupHandler } from '../controllers/auth.controller';
import type { LoginInput, SignupInput } from '../types/auth.types';

const authSchema = {
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
  app.post<{ Body: SignupInput }>(
    '/signup',
    { schema: authSchema, preHandler: app.verifyAppSecret },
    signupHandler,
  );
  app.post<{ Body: LoginInput }>(
    '/login',
    { schema: authSchema, preHandler: app.verifyAppSecret },
    loginHandler,
  );
}
