// src/components/auth-button.tsx
'use client';
import { useSession, signIn, signOut } from "next-auth/react";

export function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700">
          Welcome, {session.user?.name?.split(' ')[0] ?? 'there'}
        </span>
        <button
          onClick={() => signOut()}
          className="rounded-lg border border-slate-200 bg-transparent px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          Sign Out
        </button>
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
