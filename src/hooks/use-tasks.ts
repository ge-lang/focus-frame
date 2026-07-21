// src/hooks/use-tasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task, TaskStatus } from '@/types/task';

type TaskInput = {
  title: string;
  description?: string | null;
  priority?: Task['priority'];
  dueDate?: string | null;
  status?: TaskStatus;
};

export function useTasks() {
  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => fetch('/api/tasks').then((res) => {
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    }),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newTask: TaskInput) =>
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to create task');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// src/hooks/use-tasks.ts
export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<TaskInput> & { id: string; isCompleted?: boolean }) =>
      fetch(`/api/tasks/${id}`, {  // The ID is now passed in the URL rather than params
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to update task');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/tasks/${id}`, {  // ID in the URL
        method: 'DELETE',
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to delete task');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
