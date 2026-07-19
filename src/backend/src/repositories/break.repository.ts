import type { Prisma, PrismaClient } from '../generated/prisma';

export function findActiveBreakByUser(prisma: PrismaClient, userId: string) {
  return prisma.break.findFirst({ where: { userId, endedAt: null } });
}

export function createBreak(prisma: PrismaClient, userId: string, reason: string) {
  return prisma.break.create({
    data: { reason, user: { connect: { id: userId } } },
  });
}

export function endBreak(prisma: PrismaClient, breakId: string, endedAt: Date) {
  return prisma.break.update({ where: { id: breakId }, data: { endedAt } });
}

export function findBreaksByUser(
  prisma: PrismaClient,
  userId: string,
  range?: { from: Date; to: Date },
) {
  const where: Prisma.BreakWhereInput = {
    userId,
    ...(range
      ? { startedAt: { lt: range.to }, OR: [{ endedAt: null }, { endedAt: { gt: range.from } }] }
      : {}),
  };
  return prisma.break.findMany({ where, orderBy: { startedAt: 'desc' } });
}
