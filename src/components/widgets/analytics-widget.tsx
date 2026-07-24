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
    <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-white/50">
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
  const { data, isLoading, refetch, isFetching } = useAnalytics(timeRange);

  const metrics = useMemo(() => {
    if (!data) return [];
    const focusGoal = rangeDays[timeRange] * data.dailyFocusGoal;
    return [
      { Icon: TrendingUp, value: `${data.productivity}%`, label: 'Productivity', color: 'bg-purple-500', valueProgress: data.productivity, iconClassName: 'text-purple-500' },
      { Icon: Clock, value: formatTime(data.focusMinutes), label: 'Focus time', color: 'bg-blue-500', valueProgress: progress(data.focusMinutes, focusGoal), iconClassName: 'text-blue-500' },
      { Icon: CheckCircle, value: data.completedTasks, label: 'Completed tasks', color: 'bg-green-500', valueProgress: progress(data.completedTasks, timeRange === 'today' ? 3 : 21), iconClassName: 'text-green-500' },
      { Icon: Target, value: data.completedGoals, label: 'Completed goals', color: 'bg-orange-500', valueProgress: progress(data.completedGoals, 3), iconClassName: 'text-orange-500' },
    ];
  }, [data, timeRange]);

  return (
    <AnimatedWidget className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="h-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-800 flex items-center"><BarChart3 size={20} className="mr-2 text-purple-600" />{title || 'Productivity Analytics'}</h3>
            <p className="text-sm text-gray-600 mt-1">{timeRanges.find((range) => range.value === timeRange)?.label} • {data?.streak ?? 0} day streak</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowDetails(!showDetails)} className="p-2 text-gray-600 hover:text-gray-800" title={showDetails ? 'Hide details' : 'Show details'}>{showDetails ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            <button onClick={() => refetch()} disabled={isFetching} className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50" title="Refresh data"><RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} /></button>
          </div>
        </div>

        <div className="flex gap-1 mb-6">
          {timeRanges.map((range) => <button key={range.value} onClick={() => setTimeRange(range.value)} className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${timeRange === range.value ? 'bg-purple-500 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 shadow'}`}>{range.label}</button>)}
        </div>

        {isLoading || !data ? <div className="flex-1 grid place-items-center text-sm text-gray-500">Loading analytics…</div> : <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
          </div>

          <div className="flex items-center text-sm mb-4 text-gray-600"><TrendingUp size={16} className={data.trend >= 0 ? 'text-green-600 mr-1' : 'text-red-600 mr-1'} />{data.trend >= 0 ? '+' : ''}{data.trend}% focus time compared with the previous period</div>

          <AnimatePresence>
            {showDetails && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
              <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-white/50">
                <h4 className="font-medium text-gray-800 mb-3">Focus over the last 7 days</h4>
                <div className="flex gap-2 items-end h-24">
                  {data.dailyFocus.map((day) => <div key={day.label} className="flex-1 flex flex-col items-center h-full justify-end"><span className="text-xs text-gray-600 mb-1">{day.minutes}m</span><div className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t" style={{ height: `${Math.max(4, progress(day.minutes, 100))}%` }} /><span className="text-xs text-gray-600 mt-1">{day.label}</span></div>)}
                </div>
              </div>
              <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-white/50">
                <h4 className="font-medium text-gray-800 mb-3">Peak focus hours</h4>
                {data.peakHours.length ? <div className="flex flex-wrap gap-2">{data.peakHours.map((hour) => <span key={hour} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{hour}</span>)}</div> : <p className="text-sm text-gray-500">Complete a focus session to see your peak hours.</p>}
              </div>
            </motion.div>}
          </AnimatePresence>
        </>}
      </div>
    </AnimatedWidget>
  );
}
