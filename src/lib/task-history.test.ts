import { describe, expect, it } from 'vitest';
import { normalizeTaskHistory, normalizeTaskList, normalizeTaskRecord, taskHistoryChanges } from './task-history';

const snapshot = (overrides: Partial<{ status: 'todo' | 'in_progress' | 'done'; priority: 'low' | 'medium' | 'high'; dueDate: string | null }> = {}) => ({
  status: 'todo' as const,
  priority: 'medium' as const,
  dueDate: null,
  ...overrides,
});

describe('task history changes', () => {
  it('records adding, changing, and removing a deadline', () => {
    expect(taskHistoryChanges(snapshot(), snapshot({ dueDate: '2026-09-18' }), 'task-1', '2026-09-12T10:00:00.000Z')).toMatchObject([
      { type: 'deadline_changed', from: null, to: '2026-09-18' },
    ]);
    expect(taskHistoryChanges(snapshot({ dueDate: '2026-09-14' }), snapshot({ dueDate: '2026-09-18' }), 'task-1', '2026-09-12T10:00:00.000Z')).toMatchObject([
      { type: 'deadline_changed', from: '2026-09-14', to: '2026-09-18' },
    ]);
    expect(taskHistoryChanges(snapshot({ dueDate: '2026-09-18' }), snapshot(), 'task-1', '2026-09-12T10:00:00.000Z')).toMatchObject([
      { type: 'deadline_changed', from: '2026-09-18', to: null },
    ]);
    expect(taskHistoryChanges(snapshot(), snapshot(), 'task-1', '2026-09-12T10:00:00.000Z')).toEqual([]);
  });

  it('records priority changes only when the value changes', () => {
    expect(taskHistoryChanges(snapshot(), snapshot({ priority: 'high' }), 'task-1', '2026-09-12T10:00:00.000Z')).toMatchObject([
      { type: 'priority_changed', from: 'medium', to: 'high' },
    ]);
    expect(taskHistoryChanges(snapshot({ priority: 'high' }), snapshot({ priority: 'high' }), 'task-1', '2026-09-12T10:00:00.000Z')).toEqual([]);
  });

  it('uses one semantic event for completion and reopening', () => {
    expect(taskHistoryChanges(snapshot({ status: 'in_progress' }), snapshot({ status: 'done' }), 'task-1', '2026-09-12T10:00:00.000Z')).toMatchObject([
      { type: 'completed', from: 'in_progress', to: 'done' },
    ]);
    expect(taskHistoryChanges(snapshot({ status: 'done' }), snapshot({ status: 'todo' }), 'task-1', '2026-09-12T10:00:00.000Z')).toMatchObject([
      { type: 'reopened', from: 'done', to: 'todo' },
    ]);
  });

  it('records independent field changes with one save timestamp', () => {
    const events = taskHistoryChanges(snapshot(), snapshot({ status: 'done', priority: 'high', dueDate: '2026-09-18' }), 'task-1', '2026-09-12T10:00:00.000Z');
    expect(events.map((event) => event.type)).toEqual(['deadline_changed', 'priority_changed', 'completed']);
    expect(new Set(events.map((event) => event.createdAt))).toEqual(new Set(['2026-09-12T10:00:00.000Z']));
  });

  it('keeps old tasks without history valid', () => {
    expect(normalizeTaskHistory(undefined)).toEqual([]);
    expect(normalizeTaskHistory(null)).toEqual([]);
    expect(normalizeTaskHistory([{ id: 'event-1', type: 'created', createdAt: '2026-09-12T10:00:00.000Z' }])).toHaveLength(1);
    const legacyTask = normalizeTaskRecord({ id: 'legacy-1', title: 'Legacy task', description: 'Keep me', dueDate: null, isCompleted: false });
    expect(legacyTask).toMatchObject({ id: 'legacy-1', title: 'Legacy task', priority: 'medium', status: 'todo', history: [] });
    expect(normalizeTaskList([legacyTask, { id: 'bad' }, { id: 'new-1', title: 'New task', status: 'done' }])).toHaveLength(2);
  });
});
