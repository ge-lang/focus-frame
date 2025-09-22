// src/app/dashboard/page.tsx
'use client';
import Header from '@/components/header';
import { DashboardGrid } from '@/components/dashboard-grid';
import { useDashboard } from '@/contexts/dashboard-context';

import Dashboard  from '@/components/dashboard';

export default function DashboardPage() {
  const { state, toggleEdit } = useDashboard();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={toggleEdit}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {state.isEditing ? 'Save Layout' : 'Edit Layout'}
          </button>
        </div>

        <DashboardGrid />

         <Dashboard />
      </main>
    </div>
  );
}

