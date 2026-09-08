// src/components/header.tsx
'use client';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

const avatarLoader = ({ src }: { src: string }) => src;

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="text-xl font-semibold tracking-tight text-slate-900">FocusFrame</div>
          </div>
          
          <div className="flex items-center gap-3">
            {session?.user && (
              <>
                <span className="hidden text-sm text-slate-500 sm:inline">
                  Hello, {session.user.name}
                </span>
                <Image
                  loader={avatarLoader}
                  unoptimized
                  src={session.user.image || '/default-avatar.png'}
                  alt="User avatar"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full ring-1 ring-slate-200"
                />
                <button
                  onClick={() => signOut()}
                  className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-transparent px-3 text-sm font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
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
