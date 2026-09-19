'use client';

import type { ReactNode } from 'react';
import { useTheme, type ResolvedTheme } from './theme-provider';

export function getThemeWorkspaceClass(theme: ResolvedTheme) {
  if (theme === 'graphite') return 'ff-graphite-workspace';
  return theme === 'dark' ? 'ff-dark-workspace' : 'ff-light-workspace';
}

export function ThemeWorkspace({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <main className={`ff-page-shell ${getThemeWorkspaceClass(resolvedTheme)} min-h-screen w-full min-w-0 px-4 py-5 sm:px-6 lg:px-8`}>
      {children}
    </main>
  );
}
