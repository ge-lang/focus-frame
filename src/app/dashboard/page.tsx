// src/app/dashboard/page.tsx
'use client';
import Header from '@/components/header';
import { DashboardGrid } from '@/components/dashboard-grid';
import { useDashboard } from '@/contexts/dashboard-context';
import { DailySummary } from '@/components/daily-summary';
import { WidgetPicker } from '@/components/widget-picker';
import { Check, LayoutDashboard, SlidersHorizontal } from 'lucide-react';

export default function DashboardPage() {
  const { state, toggleEdit } = useDashboard();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-indigo-600">Your personal workspace</p>
            <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900"><LayoutDashboard size={28} /> Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            {state.isEditing && <WidgetPicker />}
            <button onClick={toggleEdit} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors ${state.isEditing ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
              {state.isEditing ? <Check size={18} /> : <SlidersHorizontal size={18} />}
              {state.isEditing ? 'Done editing' : 'Customize layout'}
            </button>
          </div>
        </div>

        {state.isEditing && <div className="mb-6 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800"><SlidersHorizontal size={16} /> Drag widgets to reorder them, or add a new widget from the menu.</div>}
        <DailySummary />
        <DashboardGrid />
      </main>
    </div>
  );
}
