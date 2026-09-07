import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/api-auth';
import { calculateProductivity, calculateStreak, calculateTrend, localDayKey, startOfLocalDay, startOfLocalRange, sumDurations } from '@/lib/analytics-utils';

type Range = 'today' | 'week' | 'month' | 'year';
const ranges: Record<Range, number> = { today: 1, week: 7, month: 30, year: 365 };

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const value = new URL(request.url).searchParams.get('range');
  const range: Range = value && value in ranges ? value as Range : 'week';
  const days = ranges[range];
  const now = new Date();
  const start = startOfLocalRange(days, now);
  const previousStart = new Date(start);
  previousStart.setDate(previousStart.getDate() - days);

  const [sessions, previousSessions, completedTasks, completedGoals, settings] = await Promise.all([
    prisma.focusSession.findMany({ where: { userId, type: 'work', completedAt: { gte: start } }, select: { duration: true, completedAt: true } }),
    prisma.focusSession.findMany({ where: { userId, type: 'work', completedAt: { gte: previousStart, lt: start } }, select: { duration: true } }),
    prisma.task.count({ where: { userId, isCompleted: true, updatedAt: { gte: start } } }),
    prisma.goal.count({ where: { userId, completed: true, updatedAt: { gte: start } } }),
    prisma.userSettings.findUnique({ where: { userId } }),
  ]);

  const focusSeconds = sumDurations(sessions);
  const previousFocusSeconds = sumDurations(previousSessions);
  const focusGoalSeconds = days * (settings?.dailyFocusGoal ?? 100) * 60;
  const taskGoal = days * 3;
  const productivity = calculateProductivity(focusSeconds, focusGoalSeconds, completedTasks, taskGoal);
  const trend = calculateTrend(focusSeconds, previousFocusSeconds);

  const dailyFocus = Array.from({ length: Math.min(days, 7) }, (_, index) => {
    const date = startOfLocalDay(now);
    date.setDate(date.getDate() - (Math.min(days, 7) - 1 - index));
    const key = localDayKey(date);
    const seconds = sumDurations(sessions.filter((session) => localDayKey(session.completedAt) === key));
    return { label: date.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1), minutes: Math.round(seconds / 60) };
  });

  const hourTotals = new Map<number, number>();
  sessions.forEach((session) => hourTotals.set(session.completedAt.getHours(), (hourTotals.get(session.completedAt.getHours()) || 0) + session.duration));
  const peakHours = [...hourTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([hour]) => `${String(hour).padStart(2, '0')}:00`);

  const allWorkSessions = await prisma.focusSession.findMany({ where: { userId, type: 'work' }, select: { completedAt: true } });
  const activeDays = new Set(allWorkSessions.map((session) => localDayKey(session.completedAt)));
  const streak = calculateStreak(activeDays, now);

  return NextResponse.json({
    productivity,
    focusMinutes: Math.round(focusSeconds / 60),
    completedTasks,
    completedGoals,
    trend,
    streak,
    peakHours,
    dailyFocus,
    dailyFocusGoal: settings?.dailyFocusGoal ?? 100,
  });
}
