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

export function shouldRetryFocusSessionWithoutTask(
  session: { taskId?: string },
  error: unknown,
): boolean {
  return Boolean(session.taskId && error instanceof Error && error.message === 'Task not found');
}

export function unlinkFocusSession(session: { duration: number; type: 'work' | 'break' | 'long_break'; taskId?: string }) {
  const { taskId: _taskId, ...unlinkedSession } = session;
  return unlinkedSession;
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
    mutationFn: async (session: { duration: number; type: 'work' | 'break' | 'long_break'; taskId?: string }) => {
      const options = (payload: typeof session): RequestInit => ({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      try {
        return await request('/api/focus-sessions', options(session));
      } catch (error) {
        // A task can be deleted or replaced while a timer is running. The focus
        // session is still valid; preserve it without a stale task relation.
        if (!shouldRetryFocusSessionWithoutTask(session, error)) throw error;
        console.warn('Persisting focus session without stale task link', { taskId: session.taskId });
        return request('/api/focus-sessions', options(unlinkFocusSession(session)));
      }
    },
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['analytics'], refetchType: 'active' });
    },
  });
}
