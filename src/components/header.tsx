// src/components/header.tsx
'use client';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

const avatarLoader = ({ src }: { src: string }) => src;

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-white/70 bg-white/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">FocusFrame</div>
          </div>
          
          <div className="flex items-center gap-3">
            {session?.user && (
              <>
                <span className="hidden text-sm text-slate-500 sm:inline">
                  Welcome, {session.user.name?.split(' ')[0] ?? 'there'}
                </span>
                <Image
                  loader={avatarLoader}
                  unoptimized
                  src={session.user.image || '/default-avatar.png'}
                  alt="User avatar"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full ring-1 ring-white/80"
                />
                <button
                  onClick={() => signOut()}
                  className="inline-flex h-9 items-center rounded-lg px-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
