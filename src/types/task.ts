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
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface TaskWithStatus extends Task {
  status: TaskStatus;
}
