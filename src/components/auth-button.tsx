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
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Sign Out
        </AnimatedButton>
      </div>
    );
  }

  return (
    <AnimatedButton
      onClick={() => signIn("google")}
      className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
    >
      Sign In
    </AnimatedButton>
  );
}