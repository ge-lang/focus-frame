'use client';

import { useTheme, type ThemePreference } from './theme-provider';
import { Monitor, Moon, Sun } from 'lucide-react';

export function ThemeControl() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <label className="ff-theme-control" title="Choose theme">
      <span className="sr-only">Theme</span>
      <span className="ff-theme-icon" aria-hidden="true">
        {resolvedTheme === 'light' ? <Sun size={16} /> : resolvedTheme === 'dark' ? <Moon size={16} /> : <Monitor size={16} />}
      </span>
      <span aria-hidden="true">{resolvedTheme === 'light' ? 'Hot' : 'Cool'}</span>
      <select className="ff-theme-select" value={theme} onChange={(event) => setTheme(event.target.value as ThemePreference)} aria-label="Theme">
        <option value="system">System</option>
        <option value="light">Hot</option>
        <option value="dark">Cool</option>
      </select>
    </label>
  );
}
