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
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-xl font-semibold tracking-tight text-slate-900">FocusFrame</div>
          </div>
          
          <div className="flex items-center space-x-4">
            {session?.user && (
              <>
                <span className="text-sm text-slate-500">
                  Hello, {session.user.name}
                </span>
                <Image
                  loader={avatarLoader}
                  unoptimized
                  src={session.user.image || '/default-avatar.png'}
                  alt="User avatar"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
                <button
                  onClick={() => signOut()}
                  className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
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
