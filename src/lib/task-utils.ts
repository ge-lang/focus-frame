import type { Task } from '@/types/task';

export type DueDateFilter = 'all' | 'overdue' | 'today' | 'upcoming' | 'none';
export type PriorityFilter = 'all' | Task['priority'];

export function toDateInputValue(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : '';
}

export function getDueDateMeta(dueDate: string | null, now = new Date()) {
  if (!dueDate) return null;

  const date = new Date(`${dueDate.slice(0, 10)}T00:00:00`);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date < today) return { label: 'Overdue', className: 'text-red-600 font-medium', type: 'overdue' as const };
  if (date.getTime() === today.getTime()) return { label: 'Due today', className: 'text-orange-600 font-medium', type: 'today' as const };
  if (date.getTime() === tomorrow.getTime()) return { label: 'Due tomorrow', className: 'text-yellow-700 font-medium', type: 'upcoming' as const };
  return { label: date.toLocaleDateString(), className: 'text-gray-500', type: 'upcoming' as const };
}

export function taskMatchesFilters(
  task: Task,
  search: string,
  priority: PriorityFilter,
  dueDate: DueDateFilter,
  now = new Date(),
): boolean {
  const normalizedSearch = search.trim().toLowerCase();
  const matchesSearch = task.title.toLowerCase().includes(normalizedSearch) ||
    task.description?.toLowerCase().includes(normalizedSearch);
  const matchesPriority = priority === 'all' || task.priority === priority;
  const dueDateMeta = getDueDateMeta(task.dueDate, now);
  const matchesDueDate = dueDate === 'all' ||
    (dueDate === 'none' && !dueDateMeta) ||
    (dueDate === 'overdue' && dueDateMeta?.type === 'overdue') ||
    (dueDate === 'today' && dueDateMeta?.type === 'today') ||
    (dueDate === 'upcoming' && dueDateMeta?.type === 'upcoming');

  return Boolean(matchesSearch && matchesPriority && matchesDueDate);
}

export function filterTasks(
  tasks: Task[],
  search: string,
  priority: PriorityFilter,
  dueDate: DueDateFilter,
  now = new Date(),
): Task[] {
  return tasks.filter((task) => taskMatchesFilters(task, search, priority, dueDate, now));
}
