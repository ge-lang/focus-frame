'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from './theme-provider';

export function ThemeControl() {
  const { theme, setTheme } = useTheme();

  return (
    <label className="ff-theme-control" title="Choose theme">
      <span className="sr-only">Theme</span>
      {theme === 'system' ? <Monitor size={14} aria-hidden="true" /> : theme === 'light' ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />}
      <select value={theme} onChange={(event) => setTheme(event.target.value as ThemePreference)} aria-label="Theme">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
