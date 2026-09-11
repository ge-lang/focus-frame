import { describe, expect, it } from 'vitest';
import { resolveHydrationPersistence, shouldPersistDashboard } from './dashboard-persistence';

describe('dashboard persistence guard', () => {
  it('does not persist during hydration or after a clean load', () => {
    expect(shouldPersistDashboard('loading', 'authenticated', false)).toBe(false);
    expect(shouldPersistDashboard('ready', 'authenticated', false)).toBe(false);
  });

  it('persists after a genuine mutation', () => {
    expect(shouldPersistDashboard('ready', 'authenticated', true)).toBe(true);
  });

  it('stops persisting after a successful save clears dirty state', () => {
    expect(shouldPersistDashboard('ready', 'authenticated', true)).toBe(true);
    expect(shouldPersistDashboard('ready', 'authenticated', false)).toBe(false);
  });

  it('marks migrated hydration dirty and advances the mutation version once', () => {
    expect(resolveHydrationPersistence(true, 4)).toEqual({ isDirty: true, mutationVersion: 5 });
    expect(shouldPersistDashboard('ready', 'authenticated', resolveHydrationPersistence(true, 4).isDirty)).toBe(true);
  });

  it('keeps current-version hydration clean and does not advance the mutation version', () => {
    const hydration = resolveHydrationPersistence(false, 4);
    expect(hydration).toEqual({ isDirty: false, mutationVersion: 4 });
    expect(shouldPersistDashboard('ready', 'authenticated', hydration.isDirty)).toBe(false);
  });

  it('allows one migration save and then remains clean after success', () => {
    const migrated = resolveHydrationPersistence(true, 0);
    expect(shouldPersistDashboard('ready', 'authenticated', migrated.isDirty)).toBe(true);
    expect(shouldPersistDashboard('ready', 'authenticated', false)).toBe(false);
  });
});
