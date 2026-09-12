import type { Task, TaskHistoryEvent, TaskHistoryEventType, TaskStatus } from '@/types/task';

type TaskHistorySnapshot = Pick<Task, 'status' | 'priority' | 'dueDate'>;

const statuses: TaskStatus[] = ['todo', 'in_progress', 'done'];
const priorities: Task['priority'][] = ['low', 'medium', 'high'];

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

export function normalizeTaskRecord(value: unknown): Task | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Partial<Task>;
  if (typeof record.id !== 'string' || typeof record.title !== 'string') return null;
  const now = new Date().toISOString();
  const status = statuses.includes(record.status as TaskStatus) ? record.status as TaskStatus : record.isCompleted ? 'done' : 'todo';
  const isCompleted = typeof record.isCompleted === 'boolean' ? record.isCompleted : status === 'done';
  return {
    id: record.id,
    title: record.title,
    description: typeof record.description === 'string' ? record.description : null,
    priority: priorities.includes(record.priority as Task['priority']) ? record.priority as Task['priority'] : 'medium',
    dueDate: typeof record.dueDate === 'string' ? record.dueDate : null,
    tags: Array.isArray(record.tags) ? record.tags.filter((tag): tag is string => typeof tag === 'string') : undefined,
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : typeof record.updatedAt === 'string' ? record.updatedAt : now,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : typeof record.createdAt === 'string' ? record.createdAt : now,
    isCompleted,
    status,
    focusSeconds: typeof record.focusSeconds === 'number' ? record.focusSeconds : undefined,
    history: normalizeTaskHistory(record.history),
  };
}

export function normalizeTaskList(value: unknown): Task[] {
  return Array.isArray(value) ? value.map(normalizeTaskRecord).filter((task): task is Task => task !== null) : [];
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
