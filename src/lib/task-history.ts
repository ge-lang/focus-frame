import type { Task, TaskHistoryEvent, TaskHistoryEventType, TaskStatus } from '@/types/task';

type TaskHistorySnapshot = Pick<Task, 'status' | 'priority' | 'dueDate'>;

const eventTypes: TaskHistoryEventType[] = [
  'created',
  'deadline_changed',
  'priority_changed',
  'status_changed',
  'completed',
  'reopened',
];

function isHistoryEvent(value: unknown): value is TaskHistoryEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<TaskHistoryEvent>;
  return typeof event.id === 'string' &&
    typeof event.createdAt === 'string' &&
    typeof event.type === 'string' &&
    eventTypes.includes(event.type as TaskHistoryEventType);
}

export function normalizeTaskHistory(value: unknown): TaskHistoryEvent[] {
  return Array.isArray(value) ? value.filter(isHistoryEvent) : [];
}

function deadlineValue(value: string | null): string | null {
  return value ? value.slice(0, 10) : null;
}

function statusEventType(from: TaskStatus, to: TaskStatus): TaskHistoryEventType {
  if (to === 'done') return 'completed';
  if (from === 'done') return 'reopened';
  return 'status_changed';
}

export function createdTaskHistoryEvent(taskId: string, createdAt: string): TaskHistoryEvent {
  return { id: `${taskId}-created-${createdAt}`, type: 'created', createdAt };
}

export function taskHistoryChanges(
  previous: TaskHistorySnapshot,
  next: TaskHistorySnapshot,
  taskId: string,
  createdAt: string,
): TaskHistoryEvent[] {
  const events: TaskHistoryEvent[] = [];
  let index = 0;
  const eventId = (type: TaskHistoryEventType) => `${taskId}-${type}-${createdAt}-${index++}`;

  const previousDeadline = deadlineValue(previous.dueDate);
  const nextDeadline = deadlineValue(next.dueDate);
  if (previousDeadline !== nextDeadline) {
    events.push({ id: eventId('deadline_changed'), type: 'deadline_changed', from: previousDeadline, to: nextDeadline, createdAt });
  }

  if (previous.priority !== next.priority) {
    events.push({ id: eventId('priority_changed'), type: 'priority_changed', from: previous.priority, to: next.priority, createdAt });
  }

  if (previous.status !== next.status) {
    const type = statusEventType(previous.status, next.status);
    events.push({ id: eventId(type), type, from: previous.status, to: next.status, createdAt });
  }

  return events;
}
