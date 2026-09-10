export type DashboardHydrationStatus = 'loading' | 'ready' | 'error';

export function shouldPersistDashboard(
  hydrationStatus: DashboardHydrationStatus,
  sessionStatus: string,
  isDirty: boolean,
): boolean {
  return hydrationStatus === 'ready' && sessionStatus === 'authenticated' && isDirty;
}
