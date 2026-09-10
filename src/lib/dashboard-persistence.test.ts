import { describe, expect, it } from 'vitest';
import { shouldPersistDashboard } from './dashboard-persistence';

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
});
