import type { PrismaClient } from '../generated/prisma';
import { createUser, findUserByEmail, findUserById } from '../repositories/user.repository';
import { hashPassword, verifyPassword } from '../utils/password';
import { AppError } from '../utils/errors';
import type { LoginInput, SignupInput } from '../types/auth.types';

export class EmailAlreadyInUseError extends AppError {
  constructor() {
    super(409, 'Email is already in use');
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super(401, 'Invalid email or password');
  }
}

export class UserNotFoundError extends AppError {
  constructor() {
    super(404, 'User not found');
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

export async function login(prisma: PrismaClient, input: LoginInput) {
  const existing = await findUserByEmail(prisma, input.email);
  if (!existing || !verifyPassword(input.password, existing.password)) {
    throw new InvalidCredentialsError();
  }

  return { id: existing.id, email: existing.email, name: existing.name };
}

export async function getMe(prisma: PrismaClient, userId: string) {
  const user = await findUserById(prisma, userId);
  if (!user) {
    throw new UserNotFoundError();
  }

  return { id: user.id, email: user.email, name: user.name };
}
