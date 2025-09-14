// src/components/auth-button.tsx
'use client';

// Убедитесь, что импортируете из правильного места
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div>
        {session.user?.name} <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }
  return <button onClick={() => signIn("google")}>Sign in with Google</button>;
}