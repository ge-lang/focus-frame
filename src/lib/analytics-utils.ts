export function localDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function startOfLocalDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function startOfLocalRange(days: number, now = new Date()): Date {
  const start = startOfLocalDay(now);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

export function sumDurations<T extends { duration: number }>(sessions: T[]): number {
  return sessions.reduce((total, session) => total + session.duration, 0);
}

export function calculateProductivity(
  focusSeconds: number,
  focusGoalSeconds: number,
  completedTasks: number,
  taskGoal: number,
): number {
  const focusProgress = focusGoalSeconds > 0 ? focusSeconds / focusGoalSeconds : 0;
  const taskProgress = taskGoal > 0 ? completedTasks / taskGoal : 0;
  return Math.round(Math.min(100, focusProgress * 70 + taskProgress * 30));
}

export function calculateTrend(current: number, previous: number): number {
  if (previous > 0) return Math.round(((current - previous) / previous) * 100);
  return current > 0 ? 100 : 0;
}

export function calculateStreak(activeDays: Set<string>, now = new Date()): number {
  let streak = 0;
  const cursor = startOfLocalDay(now);
  while (activeDays.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
