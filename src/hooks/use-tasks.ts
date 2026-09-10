// src/hooks/use-tasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task, TaskStatus } from '@/types/task';
import { showToast } from '@/lib/toast';

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
    mutationFn: async (newTask: TaskInput) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      const payload = await response.json().catch(() => null) as Task | { error?: string } | null;
      if (!response.ok) throw new Error(payload && 'error' in payload && payload.error ? payload.error : 'Failed to create task');
      if (!payload || !('id' in payload) || typeof payload.id !== 'string') throw new Error('Task response was invalid');
      return payload as Task;
    },
    onSuccess: (createdTask) => {
      queryClient.setQueryData<Task[]>(['tasks'], (current = []) => [createdTask, ...current.filter((task) => task.id !== createdTask.id)]);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showToast('Task created', 'success');
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
      showToast('Could not create task', 'error');
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
      showToast('Task saved', 'success');
    },
    onError: () => showToast('Could not save task', 'error'),
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
      showToast('Task deleted', 'success');
    },
    onError: () => showToast('Could not delete task', 'error'),
  });
}
