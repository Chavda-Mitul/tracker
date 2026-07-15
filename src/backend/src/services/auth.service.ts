import type { PrismaClient } from '../generated/prisma';
import { createUser, findUserByEmail } from '../repositories/user.repository';
import { hashPassword } from '../utils/password';
import { AppError } from '../utils/errors';
import type { SignupInput } from '../types/auth.types';

export class EmailAlreadyInUseError extends AppError {
  constructor() {
    super(409, 'Email is already in use');
  }
}

export async function signup(prisma: PrismaClient, input: SignupInput) {
  const existing = await findUserByEmail(prisma, input.email);
  if (existing) {
    throw new EmailAlreadyInUseError();
  } 

  const user = await createUser(prisma, {
    email: input.email,
    password: hashPassword(input.password),
    name: input.name,
  });

  return { id: user.id, email: user.email, name: user.name };
}
