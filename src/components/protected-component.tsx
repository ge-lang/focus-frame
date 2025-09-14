// src/components/protected-component.tsx
'use client';
import { useSession } from 'next-auth/react';

export default function ProtectedComponent() {
  const { data: session } = useSession();
  
  return (
    <div>
      {session ? (
        <span>Hello, {session.user?.name}</span>
      ) : (
        <span>Not authenticated</span>
      )}
    </div>
  );
}