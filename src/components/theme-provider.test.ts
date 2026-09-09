import { describe, expect, it } from 'vitest';
import { isThemePreference, resolveThemePreference } from './theme-provider';

describe('theme preference', () => {
  it('follows the operating system when system is selected', () => {
    expect(resolveThemePreference('system', 'light')).toBe('light');
    expect(resolveThemePreference('system', 'dark')).toBe('dark');
  });

  it('keeps an explicit light or dark choice', () => {
    expect(resolveThemePreference('light', 'dark')).toBe('light');
    expect(resolveThemePreference('dark', 'light')).toBe('dark');
  });

  it('accepts only supported stored preferences', () => {
    expect(isThemePreference('system')).toBe(true);
    expect(isThemePreference('light')).toBe(true);
    expect(isThemePreference('dark')).toBe(true);
    expect(isThemePreference('sepia')).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });
});
