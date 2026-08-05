import type { PrismaClient } from '../generated/prisma';
import { findSessionsOverlapping } from '../repositories/task.repository';
import type { ActivityDay, ActivityHeatmapQuery } from '../types/activity.types';

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function getActivityHeatmap(
  prisma: PrismaClient,
  userId: string,
  query: ActivityHeatmapQuery,
): Promise<{ days: ActivityDay[] }> {
  const now = new Date();
  const from = new Date(query.from);
  const to = new Date(query.to);
  const sessions = await findSessionsOverlapping(prisma, userId, from, to);

  const secondsByDay = new Map<string, number>();
  for (const session of sessions) {
    const start = new Date(Math.max(session.startedAt.getTime(), from.getTime()));
    const end = new Date(Math.min((session.endedAt ?? now).getTime(), to.getTime()));
    if (end <= start) continue;

    let cursor = start;
    while (cursor < end) {
      const dayEnd = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
      const chunkEnd = dayEnd < end ? dayEnd : end;
      const seconds = Math.max(0, Math.floor((chunkEnd.getTime() - cursor.getTime()) / 1000));
      const key = dateKey(cursor);
      secondsByDay.set(key, (secondsByDay.get(key) ?? 0) + seconds);
      cursor = dayEnd;
    }
  }

  const days = Array.from(secondsByDay.entries())
    .map(([date, workedSeconds]) => ({ date, workedSeconds }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { days };
}
