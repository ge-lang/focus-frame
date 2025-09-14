// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">FocusFrame</h1>
        <p className="text-lg mb-8">Your Personal Productivity Dashboard</p>
        <Link 
          href="/dashboard" 
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Launch Dashboard
        </Link>
      </div>
    </div>
  );
}