'use client';
import { memo, useMemo, useState } from 'react';
import { BarChart3, CheckCircle, Clock, Eye, EyeOff, RefreshCw, Target, TrendingUp, type LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalyticsRange, useAnalytics } from '@/hooks/use-analytics';
import { AnimatedWidget } from '@/components/animated-widget';

interface AnalyticsWidgetProps {
  widgetId: string;
  title?: string;
}

const timeRanges: Array<{ label: string; value: AnalyticsRange }> = [
  { label: 'Today', value: 'today' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

function formatTime(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ''}`;
}

function progress(value: number, goal: number) {
  return Math.min(100, Math.round((value / goal) * 100));
}

const rangeDays: Record<AnalyticsRange, number> = { today: 1, week: 7, month: 30, year: 365 };

const MetricCard = memo(function MetricCard({ Icon, value, label, color, valueProgress, iconClassName }: { Icon: LucideIcon; value: string | number; label: string; color: string; valueProgress: number; iconClassName: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between mb-2"><Icon size={20} className={iconClassName} /><span className="text-xs text-gray-500">{valueProgress}%</span></div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
      <div className="mt-2 w-full bg-gray-200 rounded-full h-1"><div className={`${color} h-1 rounded-full transition-[width] duration-300`} style={{ width: `${valueProgress}%` }} /></div>
    </div>
  );
});

export default function AnalyticsWidget({ title }: AnalyticsWidgetProps) {
  const [timeRange, setTimeRange] = useState<AnalyticsRange>('week');
  const [showDetails, setShowDetails] = useState(false);
  const { data, isLoading, isError, refetch, isFetching } = useAnalytics(timeRange);

  const metrics = useMemo(() => {
    if (!data) return [];
    const focusGoal = rangeDays[timeRange] * data.dailyFocusGoal;
    return [
      { Icon: TrendingUp, value: `${data.productivity}%`, label: 'Productivity', color: 'bg-indigo-600', valueProgress: data.productivity, iconClassName: 'text-indigo-600' },
      { Icon: Clock, value: formatTime(data.focusMinutes), label: 'Focus time', color: 'bg-indigo-600', valueProgress: progress(data.focusMinutes, focusGoal), iconClassName: 'text-indigo-600' },
      { Icon: CheckCircle, value: data.completedTasks, label: 'Completed tasks', color: 'bg-emerald-600', valueProgress: progress(data.completedTasks, timeRange === 'today' ? 3 : 21), iconClassName: 'text-emerald-600' },
      { Icon: Target, value: data.completedGoals, label: 'Completed goals', color: 'bg-indigo-600', valueProgress: progress(data.completedGoals, 3), iconClassName: 'text-indigo-600' },
    ];
  }, [data, timeRange]);

  return (
    <AnimatedWidget>
      <div className="h-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-3">
          <div>
            <h3 className="flex items-center text-lg font-semibold text-slate-900"><BarChart3 size={20} className="mr-2 text-indigo-600" />{title || 'Productivity Analytics'}</h3>
            <p className="text-sm text-gray-600 mt-1">{timeRanges.find((range) => range.value === timeRange)?.label} • {data?.streak ?? 0} day streak</p>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label={showDetails ? 'Hide analytics details' : 'Show analytics details'} onClick={() => setShowDetails(!showDetails)} className="p-2 text-gray-600 hover:text-gray-800" title={showDetails ? 'Hide details' : 'Show details'}>{showDetails ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            <button aria-label="Refresh analytics" onClick={() => refetch()} disabled={isFetching} className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50" title="Refresh data"><RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} /></button>
          </div>
        </div>

        <div className="flex gap-1 mb-6">
          {timeRanges.map((range) => <button key={range.value} onClick={() => setTimeRange(range.value)} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${timeRange === range.value ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{range.label}</button>)}
        </div>

        {isLoading || !data ? <div className="flex-1 grid place-items-center text-sm text-gray-500">{isError ? <div className="text-center"><p>Unable to load analytics.</p><button onClick={() => refetch()} className="mt-2 text-purple-700 underline">Try again</button></div> : 'Loading analytics…'}</div> : <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
          </div>

          <div className="flex items-center text-sm mb-4 text-gray-600"><TrendingUp size={16} className={data.trend >= 0 ? 'text-green-600 mr-1' : 'text-red-600 mr-1'} />{data.trend >= 0 ? '+' : ''}{data.trend}% focus time compared with the previous period</div>

          <AnimatePresence>
            {showDetails && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-medium text-gray-800 mb-3">Focus over the last 7 days</h4>
                <div className="flex gap-2 items-end h-24">
                  {data.dailyFocus.map((day) => <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end"><span className="mb-1 text-xs text-slate-600">{day.minutes}m</span><div className="w-full rounded-t bg-indigo-500" style={{ height: `${Math.max(4, progress(day.minutes, 100))}%` }} /><span className="mt-1 text-xs text-slate-600">{day.label}</span></div>)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-medium text-gray-800 mb-3">Peak focus hours</h4>
                {data.peakHours.length ? <div className="flex flex-wrap gap-2">{data.peakHours.map((hour) => <span key={hour} className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">{hour}</span>)}</div> : <p className="text-sm text-gray-500">Complete a focus session to see your peak hours.</p>}
              </div>
            </motion.div>}
          </AnimatePresence>
        </>}
      </div>
    </AnimatedWidget>
  );
}
