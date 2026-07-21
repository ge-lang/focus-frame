import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type Priority = 'low' | 'medium' | 'high';

export interface Goal {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string | null;
}

async function request(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error('Request failed');
  return response.json();
}

export function useNote(widgetId: string) {
  return useQuery<{ content: string }>({
    queryKey: ['note', widgetId],
    queryFn: () => request(`/api/notes/${encodeURIComponent(widgetId)}`),
  });
}

export function useSaveNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ widgetId, content }: { widgetId: string; content: string }) =>
      request(`/api/notes/${encodeURIComponent(widgetId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }),
    onSuccess: (_, { widgetId }) => queryClient.invalidateQueries({ queryKey: ['note', widgetId] }),
  });
}

export function useGoals() {
  return useQuery<Goal[]>({ queryKey: ['goals'], queryFn: () => request('/api/goals') });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goal: { title: string; priority: Priority }) => request('/api/goals', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(goal),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...goal }: Partial<Goal> & { id: string }) => request(`/api/goals/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(goal),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request(`/api/goals/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useBookmarks() {
  return useQuery<Bookmark[]>({ queryKey: ['bookmarks'], queryFn: () => request('/api/bookmarks') });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookmark: { title: string; url: string; category?: string }) => request('/api/bookmarks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bookmark),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request(`/api/bookmarks/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
  });
}
