// src/components/header.tsx
'use client';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

const avatarLoader = ({ src }: { src: string }) => src;

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-gray-900">FocusFrame</div>
          </div>
          
          <div className="flex items-center space-x-4">
            {session?.user && (
              <>
                <span className="text-gray-600">
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
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
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
