import { describe, expect, it } from 'vitest';
import { THEME_OPTIONS, getStoredTheme, isThemePreference, resolveThemePreference } from './theme-provider';

describe('theme preference', () => {
  it('follows the operating system when system is selected', () => {
    expect(resolveThemePreference('system', 'light')).toBe('light');
    expect(resolveThemePreference('system', 'dark')).toBe('dark');
  });

  it('keeps an explicit light or dark choice', () => {
    expect(resolveThemePreference('light', 'dark')).toBe('light');
    expect(resolveThemePreference('dark', 'light')).toBe('dark');
    expect(resolveThemePreference('graphite', 'light')).toBe('graphite');
  });

  it('accepts only supported stored preferences', () => {
    expect(isThemePreference('system')).toBe(true);
    expect(isThemePreference('light')).toBe(true);
    expect(isThemePreference('dark')).toBe(true);
    expect(isThemePreference('graphite')).toBe(true);
    expect(isThemePreference('sepia')).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });

  it('keeps Graphite and legacy Cool/Hot preferences compatible', () => {
    const storage = { getItem: (key: string) => key === 'focus-frame-theme' ? 'graphite' : null };
    expect(getStoredTheme(storage)).toBe('graphite');
    expect(getStoredTheme({ getItem: () => 'dark' })).toBe('dark');
    expect(getStoredTheme({ getItem: () => 'light' })).toBe('light');
    expect(getStoredTheme({ getItem: () => 'unknown' })).toBe('dark');
  });

  it('exposes the three user-facing theme choices alongside System', () => {
    expect(THEME_OPTIONS.map((option) => option.label)).toEqual(['System', 'Hot', 'Cool', 'Graphite']);
    expect(THEME_OPTIONS.map((option) => option.value)).toContain('graphite');
  });
});
