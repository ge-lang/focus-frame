import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface UserSettings {
  dailyFocusGoal: number;
  dailyPomodoroGoal: number;
  notificationsEnabled: boolean;
}

async function request(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error('Request failed');
  return response.json();
}

export function useUserSettings() {
  return useQuery<UserSettings>({ queryKey: ['settings'], queryFn: () => request('/api/settings') });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<UserSettings>) => request('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });
}
