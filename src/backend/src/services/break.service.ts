import type { PrismaClient } from '../generated/prisma';
import {
  createBreak,
  endBreak,
  findActiveBreakByUser,
  findBreaksByUser,
} from '../repositories/break.repository';
import { AppError } from '../utils/errors';
import type { GetBreaksQuery } from '../types/break.types';

export async function startBreak(prisma: PrismaClient, userId: string, reason: string) {
  if (!reason.trim()) {
    throw new AppError(400, 'reason is required');
  }
  const activeBreak = await findActiveBreakByUser(prisma, userId);
  if (activeBreak) {
    throw new AppError(409, 'a break is already active');
  }
  return createBreak(prisma, userId, reason.trim());
}

export async function stopBreak(prisma: PrismaClient, userId: string) {
  const activeBreak = await findActiveBreakByUser(prisma, userId);
  if (!activeBreak) {
    throw new AppError(409, 'no active break to end');
  }
  return endBreak(prisma, activeBreak.id, new Date());
}

export async function getBreaks(prisma: PrismaClient, userId: string, query: GetBreaksQuery = {}) {
  const range = query.from && query.to ? { from: new Date(query.from), to: new Date(query.to) } : undefined;
  return findBreaksByUser(prisma, userId, range);
}
