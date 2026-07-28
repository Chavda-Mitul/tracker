import type { PrismaClient } from '../generated/prisma';
import { createUser, findUserByEmail, findUserById } from '../repositories/user.repository';
import { hashPassword, verifyPassword } from '../utils/password';
import { AppError } from '../utils/errors';
import type { LoginInput, SignupInput } from '../types/auth.types';

export async function signup(prisma: PrismaClient, input: SignupInput) {
  const existing = await findUserByEmail(prisma, input.email);
  if (existing) {
    throw new AppError(409, 'Email is already in use');
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
    throw new AppError(401, 'Invalid email or password');
  }

  return { id: existing.id, email: existing.email, name: existing.name };
}

export async function getMe(prisma: PrismaClient, userId: string) {
  const user = await findUserById(prisma, userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return { id: user.id, email: user.email, name: user.name };
}
