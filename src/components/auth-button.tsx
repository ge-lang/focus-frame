// src/components/auth-button.tsx
'use client';
import { useSession, signIn, signOut } from "next-auth/react";

export function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="ff-user-zone">
        <span className="ff-user-greeting">
          Welcome, {session.user?.name?.split(' ')[0] ?? 'there'}
        </span>
        <button
          onClick={() => signOut()}
          className="ff-signout"
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
