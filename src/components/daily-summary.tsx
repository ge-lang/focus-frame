'use client';
import { CheckCircle2, Clock3, Target } from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';
import { useTasks } from '@/hooks/use-tasks';

function ProgressCard({ icon, label, value, progress, color }: { icon: React.ReactNode; label: string; value: string; progress: number; color: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between text-slate-500"><span className="text-sm font-medium">{label}</span>{icon}</div>
    <div className="mt-2 text-xl font-bold tracking-tight text-slate-900">{value}</div>
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, progress)}%` }} /></div>
  </div>;
}

export function DailySummary() {
  const { data: analytics } = useAnalytics('today');
  const { data: tasks = [] } = useTasks();
  const completedTasks = tasks.filter((task) => task.isCompleted).length;
  const focusMinutes = analytics?.focusMinutes ?? 0;
  const focusGoal = analytics?.dailyFocusGoal ?? 100;

  return <section aria-label="Daily progress" className="mb-8 grid gap-3 sm:grid-cols-3">
    <ProgressCard icon={<Clock3 size={18} />} label="Focus today" value={`${focusMinutes} / ${focusGoal} min`} progress={(focusMinutes / focusGoal) * 100} color="bg-indigo-500" />
    <ProgressCard icon={<CheckCircle2 size={18} />} label="Tasks complete" value={`${completedTasks} / 3`} progress={(completedTasks / 3) * 100} color="bg-emerald-500" />
    <ProgressCard icon={<Target size={18} />} label="Current streak" value={`${analytics?.streak ?? 0} days`} progress={(analytics?.streak ?? 0) * 10} color="bg-amber-500" />
  </section>;
}
