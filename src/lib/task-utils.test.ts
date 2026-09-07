import { describe, expect, it } from 'vitest';
import { filterTasks, getDueDateMeta } from './task-utils';
import type { Task } from '@/types/task';

const tasks: Task[] = [
  { id: '1', title: 'Write report', description: 'Quarterly review', priority: 'high', dueDate: '2025-01-09T00:00:00.000Z', createdAt: '', updatedAt: '', isCompleted: false, status: 'todo' },
  { id: '2', title: 'Buy milk', description: null, priority: 'low', dueDate: null, createdAt: '', updatedAt: '', isCompleted: false, status: 'todo' },
];

describe('task helpers', () => {
  const now = new Date(2025, 0, 10, 12);

  it('classifies overdue, today, upcoming and missing deadlines', () => {
    expect(getDueDateMeta('2025-01-09', now)?.type).toBe('overdue');
    expect(getDueDateMeta('2025-01-10', now)?.type).toBe('today');
    expect(getDueDateMeta('2025-01-11', now)?.type).toBe('upcoming');
    expect(getDueDateMeta(null, now)).toBeNull();
  });

  it('filters by title/description search, priority and deadline', () => {
    expect(filterTasks(tasks, 'quarterly', 'all', 'all', now).map((task) => task.id)).toEqual(['1']);
    expect(filterTasks(tasks, '', 'low', 'none', now).map((task) => task.id)).toEqual(['2']);
    expect(filterTasks(tasks, '', 'high', 'overdue', now).map((task) => task.id)).toEqual(['1']);
  });
});
