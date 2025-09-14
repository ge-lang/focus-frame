// src/app/auth/signin/page.tsx
'use client';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">FocusFrame</h1>
        <button
          onClick={() => signIn('google')}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Sign in with Google
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Demo: Use your Google account to access your personal dashboard
          </p>
        </div>
      </div>
    </div>
  );
}