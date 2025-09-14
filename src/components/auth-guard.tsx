// src/components/auth-guard.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // ВРЕМЕННО: пропускаем проверку аутентификации
    // router.push('/auth/signin');
  }, [router]);

  return <>{children}</>;
}