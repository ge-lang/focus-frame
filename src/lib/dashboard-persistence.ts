export type DashboardHydrationStatus = 'loading' | 'ready' | 'error';

export interface HydrationPersistenceState {
  isDirty: boolean;
  mutationVersion: number;
}

export function resolveHydrationPersistence(
  didMigrate: boolean,
  currentMutationVersion: number,
): HydrationPersistenceState {
  return {
    isDirty: didMigrate,
    mutationVersion: currentMutationVersion + (didMigrate ? 1 : 0),
  };
}

export function shouldPersistDashboard(
  hydrationStatus: DashboardHydrationStatus,
  sessionStatus: string,
  isDirty: boolean,
): boolean {
  return hydrationStatus === 'ready' && sessionStatus === 'authenticated' && isDirty;
}
