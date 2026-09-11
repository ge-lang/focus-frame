import { describe, expect, it } from 'vitest';
import { compactPresentationLimits, getCompactCalendarGrid, shouldOpenCompactFocusView, summarizeCompactTasks } from './compact-widget-renderer';
import type { Task } from '@/types/task';

const task = (overrides: Partial<Task>): Task => ({
  id: 'task-1',
  title: 'Task',
  description: null,
  priority: 'medium',
  dueDate: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  isCompleted: false,
  status: 'todo',
  ...overrides,
});

describe('compact widget presentation helpers', () => {
  it('summarizes statuses and keeps one nearest unfinished task', () => {
    const result = summarizeCompactTasks([
      task({ id: 'done', status: 'done', isCompleted: true }),
      task({ id: 'later', title: 'Later', dueDate: '2026-09-20T00:00:00.000Z', priority: 'low' }),
      task({ id: 'soon', title: 'Soon', dueDate: '2026-09-12T00:00:00.000Z', priority: 'high', status: 'in_progress' }),
    ]);

    expect(result.completed).toBe(1);
    expect(result.total).toBe(3);
    expect(result.counts).toEqual({ todo: 1, in_progress: 1, done: 1 });
    expect(result.relevantTask?.id).toBe('soon');
  });

  it('builds a Monday-first current-month grid without navigation metadata', () => {
    const grid = getCompactCalendarGrid(new Date(2026, 8, 11), 'en-US');

    expect(grid.monthLabel).toBe('September 2026');
    expect(grid.weekdayLabels).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
    expect(grid.cells).toHaveLength(35);
  });

  it('keeps compact content intentionally bounded', () => {
    expect(compactPresentationLimits).toEqual({ news: 2, bookmarks: 3, goals: 2, relevantTasks: 1 });
  });

  it('opens Focus View only for a click on a non-interactive tile surface', () => {
    expect(shouldOpenCompactFocusView(false, false)).toBe(true);
    expect(shouldOpenCompactFocusView(true, false)).toBe(false);
    expect(shouldOpenCompactFocusView(false, true)).toBe(false);
  });
});
