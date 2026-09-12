import { describe, expect, it } from 'vitest';
import type { Task } from '@/types/task';
import { calendarMonthCells, calendarSummary, localDateKey, taskDeadlineKey, tasksForCalendarDate, upcomingTasksWithinDays } from './calendar-agenda';

const makeTask = (overrides: Partial<Task>): Task => ({
  id: 'task-1', title: 'Task', description: null, priority: 'medium', dueDate: null,
  createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z', isCompleted: false, status: 'todo', ...overrides,
});

describe('calendar agenda helpers', () => {
  it('creates a Monday-first month grid with complete weeks', () => {
    const cells = calendarMonthCells(new Date(2026, 8, 1));
    expect(cells.slice(0, 2)).toEqual([null, 1]);
    expect(cells).toHaveLength(35);
  });

  it('matches task deadlines by local calendar date without shifting UTC dates', () => {
    const task = makeTask({ dueDate: '2026-09-12T23:30:00.000Z' });
    expect(taskDeadlineKey(task.dueDate)).toBe('2026-09-12');
    expect(tasksForCalendarDate([task], '2026-09-12')).toEqual([task]);
    expect(localDateKey(new Date(2026, 8, 12))).toBe('2026-09-12');
  });

  it('derives upcoming tasks and summary counts from canonical task state', () => {
    const today = new Date(2026, 8, 12);
    const tasks = [
      makeTask({ id: 'upcoming', dueDate: '2026-09-14', priority: 'high' }),
      makeTask({ id: 'overdue', dueDate: '2026-09-10', priority: 'low' }),
      makeTask({ id: 'done', dueDate: '2026-09-13', isCompleted: true, status: 'done' }),
    ];
    expect(upcomingTasksWithinDays(tasks, today).map((task) => task.id)).toEqual(['upcoming']);
    expect(calendarSummary(tasks, today)).toEqual({ upcoming: 1, overdue: 1, highPriority: 1 });
  });
});
