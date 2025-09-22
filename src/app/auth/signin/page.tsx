// src/app/auth/signin/page.tsx
'use client';
import { signIn } from "next-auth/react";
import { AnimatedButton } from "@/components/animated-button";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Компонент для использования useSearchParams с Suspense
function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSignIn = async () => {
    try {
      await signIn('google', { 
        callbackUrl,
        redirect: true 
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Focus Frame</h2>
          <p className="mt-2 text-gray-600">Sign in to your dashboard</p>
        </div>
        
        <div className="mt-8">
          <AnimatedButton
            onClick={handleSignIn}
            className="w-full bg-blue-600"
          >
            Sign in with Google
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}

// Основной компонент страницы
export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Focus Frame</h2>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}