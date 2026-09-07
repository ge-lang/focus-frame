// src/components/auth-button.tsx
'use client';
import { useSession, signIn, signOut } from "next-auth/react";
import { AnimatedButton } from "./animated-button";

export function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700">
          Welcome, {session.user?.name}!
        </span>
        <AnimatedButton
          onClick={() => signOut()}
          className="border border-slate-200 bg-transparent px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
        >
          Sign Out
        </AnimatedButton>
      </div>
    );
  }

  return (
    <AnimatedButton
      onClick={() => signIn("google")}
      className="rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
    >
      Sign In
    </AnimatedButton>
  );
}
