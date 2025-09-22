// src/components/dashboard.tsx
'use client';
import { useDashboard } from '@/contexts/dashboard-context';
import { DashboardGrid } from './dashboard-grid';
import  EditToolbar  from './edit-toolbar';
import { AnimatedButton } from './animated-button';
import { Settings } from 'lucide-react';

export default function Dashboard() {
  const { state, toggleEdit } = useDashboard();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Заголовок и управление */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {state.widgets.length} widgets • {state.isEditing ? 'Editing mode' : 'View mode'}
          </p>
        </div>
        
        {!state.isEditing ? (
          <AnimatedButton
            onClick={toggleEdit}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Settings size={18} />
            <span>Customize</span>
          </AnimatedButton>
        ) : (
          <EditToolbar />
        )}
      </div>

      {/* Сетка виджетов */}
      <DashboardGrid />

      {/* Пустое состояние */}
      {state.widgets.length === 0 && !state.isEditing && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📺</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No widgets yet</h3>
          <p className="text-gray-600 mb-4">Start by adding some widgets to your dashboard</p>
          <AnimatedButton
            onClick={toggleEdit}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            <Settings size={18} className="mr-2" />
            Add Widgets
          </AnimatedButton>
        </div>
      )}
    </div>
  );
}