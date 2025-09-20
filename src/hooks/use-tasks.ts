// src/hooks/use-tasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
}

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
    mutationFn: (newTask: { title: string }) =>
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
    mutationFn: ({ id, title, isCompleted }: { id: string; title?: string; isCompleted?: boolean }) =>
      fetch(`/api/tasks/${id}`, {  // Теперь ID передается в URL, а не в params
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, isCompleted }),
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
      fetch(`/api/tasks/${id}`, {  // ID в URL
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
