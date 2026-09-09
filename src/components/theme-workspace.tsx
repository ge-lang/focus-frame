'use client';

import type { ReactNode } from 'react';
import { useTheme } from './theme-provider';

export function ThemeWorkspace({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <main className={`ff-page-shell ${resolvedTheme === 'dark' ? 'ff-dark-workspace' : 'ff-light-workspace'} min-h-screen px-4 py-5 sm:px-6 lg:px-8`}>
      {children}
    </main>
  );
}
