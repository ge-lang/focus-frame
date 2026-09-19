import { describe, expect, it } from 'vitest';
import { getThemeWorkspaceClass } from './theme-workspace';

describe('theme workspace scope', () => {
  it('uses the same Graphite theme scope on every responsive layout', () => {
    expect(getThemeWorkspaceClass('graphite')).toBe('ff-graphite-workspace');
    expect(getThemeWorkspaceClass('dark')).toBe('ff-dark-workspace');
    expect(getThemeWorkspaceClass('light')).toBe('ff-light-workspace');
  });
});
