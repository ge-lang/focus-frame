'use client';

import { THEME_OPTIONS, useTheme, type ThemePreference } from './theme-provider';
import { CircleDot, Moon, Sun } from 'lucide-react';

export function ThemeControl() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="ff-theme-control" title="Choose theme">
      <span className="sr-only">Theme</span>
      <span className="ff-theme-icon" aria-hidden="true">
        {resolvedTheme === 'light' ? <Sun size={16} /> : resolvedTheme === 'graphite' ? <CircleDot size={16} /> : <Moon size={16} />}
      </span>
      <select className="ff-theme-select" value={theme} onChange={(event) => setTheme(event.target.value as ThemePreference)} aria-label="Theme">
        {THEME_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}
