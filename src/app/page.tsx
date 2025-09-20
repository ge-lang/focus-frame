// src/app/page.tsx
/*import Link from 'next/link';

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
}*/

// src/app/page.tsx
import  AuthGuard  from '@/components/auth-guard';
import { DashboardGrid } from '@/components/dashboard-grid';
import { EditToggle } from '@/components/edit-toggle';
import { WidgetPicker } from '@/components/widget-picker';
import { AuthButton } from '@/components/auth-button';

export default function Home() {
  return (
    <AuthGuard>
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Focus Frame</h1>
          <div className="flex items-center space-x-4">
            <AuthButton />
            <WidgetPicker />
            <EditToggle />
          </div>
        </div>
        <DashboardGrid />
      </main>
    </AuthGuard>
  );
}