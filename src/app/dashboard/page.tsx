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
    <div className="min-h-screen bg-[var(--ff-background)]">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-indigo-600">Your personal workspace</p>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900"><LayoutDashboard size={22} className="text-indigo-600" /> Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            {state.isEditing && <WidgetPicker />}
            <button onClick={toggleEdit} className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors ${state.isEditing ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
              {state.isEditing ? <Check size={18} /> : <SlidersHorizontal size={18} />}
              {state.isEditing ? 'Done editing' : 'Customize layout'}
            </button>
          </div>
        </div>

        {state.isEditing && <div className="mb-6 flex items-center gap-2 rounded-lg border border-indigo-200/70 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-800"><SlidersHorizontal size={16} /> Drag widgets to reposition them, or add a new widget from the menu.</div>}
        <DailySummary />
        <DashboardGrid />
      </main>
    </div>
  );
}
