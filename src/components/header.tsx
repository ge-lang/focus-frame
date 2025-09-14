// src/components/header.tsx
'use client';
import { useSession, signOut } from 'next-auth/react';

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
                <img
                  src={session.user.image || '/default-avatar.png'}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full"
                />
                <button
                  onClick={() => signOut()}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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