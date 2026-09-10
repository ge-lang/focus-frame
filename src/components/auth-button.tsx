// src/components/auth-button.tsx
'use client';
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function AuthButton() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (session) {
    return (
      <div className="ff-user-zone" ref={accountRef}>
        <button type="button" className="ff-account-trigger" aria-expanded={isOpen} aria-haspopup="menu" onClick={() => setIsOpen((open) => !open)}>
          {session.user?.name?.split(' ')[0] ?? 'there'}
          <ChevronDown size={13} aria-hidden="true" />
        </button>
        {isOpen && <div className="ff-account-menu" role="menu"><button type="button" role="menuitem" onClick={() => signOut()}>Sign out</button></div>}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
    >
      Sign In
    </button>
  );
}
