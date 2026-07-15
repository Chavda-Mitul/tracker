import type { PrismaClient } from '../generated/prisma';

export function findUserByEmail(prisma: PrismaClient, email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(prisma: PrismaClient, id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function createUser(
  prisma: PrismaClient,
  data: { email: string; password: string; name?: string },
) {
  return prisma.user.create({ data });
}