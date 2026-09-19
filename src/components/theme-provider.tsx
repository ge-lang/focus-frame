'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark' | 'graphite';
export type SystemTheme = 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark' | 'graphite';

export const THEME_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Hot' },
  { value: 'dark', label: 'Cool' },
  { value: 'graphite', label: 'Graphite' },
] as const;

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

const STORAGE_KEY = 'focus-frame-theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark' || value === 'graphite';
}

export function resolveThemePreference(preference: ThemePreference, systemTheme: SystemTheme): ResolvedTheme {
  return preference === 'system' ? systemTheme : preference;
}

export function getStoredTheme(storage?: Pick<Storage, 'getItem'> | null): ThemePreference {
  const source = storage ?? (typeof window !== 'undefined' ? window.localStorage : null);
  if (!source) return 'dark';
  const stored = source.getItem(STORAGE_KEY);
  return isThemePreference(stored) ? stored : 'dark';
}

function getSystemTheme(): SystemTheme {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>('dark');
  const [systemTheme, setSystemTheme] = useState<SystemTheme>('dark');
  const resolvedTheme = resolveThemePreference(theme, systemTheme);

  useEffect(() => {
    setThemeState(getStoredTheme());
    setSystemTheme(getSystemTheme());
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (event: MediaQueryListEvent) => setSystemTheme(event.matches ? 'light' : 'dark');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.ffTheme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo(() => ({
    theme,
    resolvedTheme,
    setTheme: (nextTheme: ThemePreference) => {
      setThemeState(nextTheme);
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    },
  }), [resolvedTheme, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
