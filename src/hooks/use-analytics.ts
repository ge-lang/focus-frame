import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type AnalyticsRange = 'today' | 'week' | 'month' | 'year';

export interface AnalyticsData {
  productivity: number;
  focusMinutes: number;
  completedTasks: number;
  completedGoals: number;
  trend: number;
  streak: number;
  peakHours: string[];
  dailyFocus: Array<{ label: string; minutes: number }>;
  dailyFocusGoal: number;
}

async function request(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error ?? `Request failed (${response.status})`);
  }
  return response.json();
}

export function useAnalytics(range: AnalyticsRange) {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics', range],
    queryFn: () => request(`/api/analytics?range=${range}`),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (session: { duration: number; type: 'work' | 'break' | 'long_break'; taskId?: string }) => request('/api/focus-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    }),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['analytics'], refetchType: 'active' });
    },
  });
}
