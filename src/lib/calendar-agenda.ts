import type { Task } from '@/types/task';

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function taskDeadlineKey(dueDate: string | null): string | null {
  if (!dueDate) return null;
  const match = dueDate.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

export function tasksForCalendarDate(tasks: Task[], dateKey: string): Task[] {
  return tasks.filter((task) => taskDeadlineKey(task.dueDate) === dateKey);
}

export function calendarMonthCells(date: Date): Array<number | null> {
  const firstDayOffset = (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const cellCount = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;
  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstDayOffset + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function upcomingTasksWithinDays(tasks: Task[], today: Date, days = 7): Task[] {
  const start = startOfLocalDay(today);
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  return tasks
    .filter((task) => {
      const key = taskDeadlineKey(task.dueDate);
      if (!key || task.isCompleted || task.status === 'done') return false;
      const dueDate = new Date(`${key}T00:00:00`);
      return dueDate >= start && dueDate <= end;
    })
    .sort((first, second) => (taskDeadlineKey(first.dueDate) ?? '').localeCompare(taskDeadlineKey(second.dueDate) ?? ''));
}

export function calendarSummary(tasks: Task[], today: Date) {
  const start = startOfLocalDay(today);
  const weekEnd = new Date(start);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const activeDatedTasks = tasks.filter((task) => {
    const key = taskDeadlineKey(task.dueDate);
    return key && !task.isCompleted && task.status !== 'done';
  });
  const upcoming = activeDatedTasks.filter((task) => {
    const dueDate = new Date(`${taskDeadlineKey(task.dueDate)}T00:00:00`);
    return dueDate >= start && dueDate <= weekEnd;
  });
  const overdue = activeDatedTasks.filter((task) => new Date(`${taskDeadlineKey(task.dueDate)}T00:00:00`) < start);
  const highPriority = upcoming.filter((task) => task.priority === 'high');
  return { upcoming: upcoming.length, overdue: overdue.length, highPriority: highPriority.length };
}
