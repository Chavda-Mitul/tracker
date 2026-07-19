import type { PrismaClient } from '../generated/prisma';
import {
  createBreak,
  endBreak,
  findActiveBreakByUser,
  findBreaksByUser,
} from '../repositories/break.repository';
import { AppError } from '../utils/errors';
import type { GetBreaksQuery } from '../types/break.types';

export class BreakAlreadyActiveError extends AppError {
  constructor() {
    super(409, 'a break is already active');
  }
}

export class NoActiveBreakError extends AppError {
  constructor() {
    super(409, 'no active break to end');
  }
}

export class MissingBreakReasonError extends AppError {
  constructor() {
    super(400, 'reason is required');
  }
}

export async function startBreak(prisma: PrismaClient, userId: string, reason: string) {
  if (!reason.trim()) {
    throw new MissingBreakReasonError();
  }
  const activeBreak = await findActiveBreakByUser(prisma, userId);
  if (activeBreak) {
    throw new BreakAlreadyActiveError();
  }
  return createBreak(prisma, userId, reason.trim());
}

export async function stopBreak(prisma: PrismaClient, userId: string) {
  const activeBreak = await findActiveBreakByUser(prisma, userId);
  if (!activeBreak) {
    throw new NoActiveBreakError();
  }
  return endBreak(prisma, activeBreak.id, new Date());
}

export async function getBreaks(prisma: PrismaClient, userId: string, query: GetBreaksQuery = {}) {
  const range = query.from && query.to ? { from: new Date(query.from), to: new Date(query.to) } : undefined;
  return findBreaksByUser(prisma, userId, range);
}
