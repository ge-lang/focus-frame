import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/api-auth';

type Range = 'today' | 'week' | 'month' | 'year';
const ranges: Record<Range, number> = { today: 1, week: 7, month: 30, year: 365 };

function startOfRange(days: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const value = new URL(request.url).searchParams.get('range');
  const range: Range = value && value in ranges ? value as Range : 'week';
  const days = ranges[range];
  const start = startOfRange(days);
  const previousStart = new Date(start);
  previousStart.setDate(previousStart.getDate() - days);

  const [sessions, previousSessions, completedTasks, completedGoals] = await Promise.all([
    prisma.focusSession.findMany({ where: { userId, type: 'work', completedAt: { gte: start } }, select: { duration: true, completedAt: true } }),
    prisma.focusSession.findMany({ where: { userId, type: 'work', completedAt: { gte: previousStart, lt: start } }, select: { duration: true } }),
    prisma.task.count({ where: { userId, isCompleted: true, updatedAt: { gte: start } } }),
    prisma.goal.count({ where: { userId, completed: true, updatedAt: { gte: start } } }),
  ]);

  const focusSeconds = sessions.reduce((total, session) => total + session.duration, 0);
  const previousFocusSeconds = previousSessions.reduce((total, session) => total + session.duration, 0);
  const focusGoalSeconds = days * 4 * 25 * 60;
  const taskGoal = days * 3;
  const productivity = Math.round(Math.min(100, ((focusSeconds / focusGoalSeconds) * 70 + (completedTasks / taskGoal) * 30)));
  const trend = previousFocusSeconds ? Math.round(((focusSeconds - previousFocusSeconds) / previousFocusSeconds) * 100) : focusSeconds ? 100 : 0;

  const dailyFocus = Array.from({ length: Math.min(days, 7) }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (Math.min(days, 7) - 1 - index));
    const key = dayKey(date);
    const seconds = sessions.filter((session) => dayKey(session.completedAt) === key).reduce((sum, session) => sum + session.duration, 0);
    return { label: date.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1), minutes: Math.round(seconds / 60) };
  });

  const hourTotals = new Map<number, number>();
  sessions.forEach((session) => hourTotals.set(session.completedAt.getHours(), (hourTotals.get(session.completedAt.getHours()) || 0) + session.duration));
  const peakHours = [...hourTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([hour]) => `${String(hour).padStart(2, '0')}:00`);

  const allWorkSessions = await prisma.focusSession.findMany({ where: { userId, type: 'work' }, select: { completedAt: true } });
  const activeDays = new Set(allWorkSessions.map((session) => dayKey(session.completedAt)));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (activeDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return NextResponse.json({
    productivity,
    focusMinutes: Math.round(focusSeconds / 60),
    completedTasks,
    completedGoals,
    trend,
    streak,
    peakHours,
    dailyFocus,
  });
}
