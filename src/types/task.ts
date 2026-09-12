// src/types/task.ts
export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
  status: TaskStatus;
  focusSeconds?: number;
  history?: TaskHistoryEvent[];
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TaskHistoryEventType =
  | 'created'
  | 'deadline_changed'
  | 'priority_changed'
  | 'status_changed'
  | 'completed'
  | 'reopened';

export interface TaskHistoryEvent {
  id: string;
  type: TaskHistoryEventType;
  from?: string | null;
  to?: string | null;
  createdAt: string;
}

export interface TaskWithStatus extends Task {
  status: TaskStatus;
}
