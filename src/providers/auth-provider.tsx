// src/providers/auth-provider.tsx
'use client'; // Важно: это клиентский компонент

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}