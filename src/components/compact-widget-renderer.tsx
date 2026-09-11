'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  BarChart3,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CloudSun,
  Flag,
  Newspaper,
  Pause,
  Play,
  Plus,
  Target,
  Timer,
  TrendingUp,
  StickyNote,
} from 'lucide-react';
import { AnimatedWidget } from '@/components/animated-widget';
import { WeatherIcon } from '@/components/weather-icon';
import { useAnalytics, useCreateFocusSession } from '@/hooks/use-analytics';
import { useNews } from '@/hooks/use-news';
import { useTasks } from '@/hooks/use-tasks';
import { useWeather } from '@/hooks/useWeather';
import { useBookmarks, useCreateBookmark, useCreateGoal, useGoals, useNote, useSaveNote } from '@/hooks/use-personal-widgets';
import type { Widget, WidgetType } from '@/types/dashboard';
import type { Task } from '@/types/task';

interface CompactWidgetProps {
  widget: Widget;
  onOpen: () => void;
}

function CompactShell({ widget, onOpen, icon, children }: CompactWidgetProps & { icon: ReactNode; children: ReactNode }) {
  return (
    <AnimatedWidget className="ff-compact-card">
      <div className="flex h-full min-h-0 flex-col">
        <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
          <h3 className="widget-drag-handle flex min-w-0 cursor-grab select-none items-center gap-2 truncate text-base font-semibold text-slate-900 active:cursor-grabbing">
            {icon}
            <span className="truncate">{widget.title || labelForType(widget.type)}</span>
          </h3>
          <button type="button" data-no-drag onClick={onOpen} className="ff-compact-open shrink-0 rounded px-1.5 py-0.5 text-xs font-medium" aria-label={`Open ${labelForType(widget.type)}`}>
            Open
          </button>
        </div>
        {children}
      </div>
    </AnimatedWidget>
  );
}

function labelForType(type: WidgetType) {
  return type === 'todo' ? 'Tasks' : type[0].toUpperCase() + type.slice(1);
}

function priorityClass(priority: Task['priority']) {
  return priority === 'high' ? 'ff-compact-priority-high' : priority === 'medium' ? 'ff-compact-priority-medium' : 'ff-compact-priority-low';
}

function relevantTask(tasks: Task[]) {
  return [...tasks]
    .filter((task) => !task.isCompleted && task.status !== 'done')
    .sort((first, second) => {
      if (!first.dueDate && !second.dueDate) return 0;
      if (!first.dueDate) return 1;
      if (!second.dueDate) return -1;
      return first.dueDate.localeCompare(second.dueDate);
    })[0];
}

function CompactTasks({ widget, onOpen }: CompactWidgetProps) {
  const { data: tasks = [] } = useTasks();
  const completed = tasks.filter((task) => task.isCompleted || task.status === 'done').length;
  const selected = relevantTask(tasks);
  const counts = {
    todo: tasks.filter((task) => task.status === 'todo').length,
    in_progress: tasks.filter((task) => task.status === 'in_progress').length,
    done: tasks.filter((task) => task.status === 'done' || task.isCompleted).length,
  };

  return (
    <CompactShell widget={widget} onOpen={onOpen} icon={<CheckCircle2 size={16} className="text-indigo-600" />}>
      <div className="flex min-h-0 flex-1 flex-col justify-between gap-2">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500"><span>{completed}/{tasks.length} completed</span><span className="ff-compact-progress"><span style={{ width: `${tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%` }} /></span></div>
          <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
            {([['To Do', counts.todo], ['In Progress', counts.in_progress], ['Done', counts.done]] as const).map(([label, count]) => <div key={label} className="ff-compact-status"><span className="block font-medium text-slate-700">{label}</span><span className="text-slate-500">{count}</span></div>)}
          </div>
        </div>
        {selected ? <div className="min-w-0"><div className="flex items-center gap-1.5"><Flag size={12} className="shrink-0 text-slate-400" /><span className="truncate text-sm font-medium text-slate-800">{selected.title}</span><span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] ${priorityClass(selected.priority)}`}>{selected.priority}</span></div>{selected.dueDate && <p className="mt-0.5 text-[11px] text-slate-500">Due {new Date(selected.dueDate).toLocaleDateString()}</p>}</div> : <p className="text-xs text-slate-500">No unfinished tasks</p>}
        <button type="button" data-no-drag onClick={onOpen} className="ff-compact-action inline-flex w-fit items-center gap-1 text-xs font-medium text-indigo-700"><Plus size={13} /> Add Task</button>
      </div>
    </CompactShell>
  );
}

function CompactNews({ widget, onOpen }: CompactWidgetProps) {
  const { articles, loading, isDemo } = useNews('general');
  return <CompactShell widget={widget} onOpen={onOpen} icon={<Newspaper size={16} className="text-indigo-600" />}>
    <div className="min-h-0 flex-1">
      <p className="mb-1 text-[11px] text-slate-500">{isDemo ? 'Demo News' : 'Live News'} · {articles.length} articles</p>
      {loading ? <p className="text-xs text-slate-500">Loading headlines…</p> : <div className="space-y-1">{articles.slice(0, 2).map((article, index) => <a data-no-drag key={`${article.title}-${index}`} href={article.url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs font-medium text-slate-800 hover:text-indigo-700">{article.title}</a>)}</div>}
    </div>
  </CompactShell>;
}

function CompactPomodoro({ widget, onOpen }: CompactWidgetProps) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const { data: tasks = [] } = useTasks();
  const { mutate: createFocusSession } = useCreateFocusSession();
  const task = tasks.find((candidate) => !candidate.isCompleted && candidate.status !== 'done');
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((value) => {
      if (value <= 1) {
        setRunning(false);
        createFocusSession({ duration: 25 * 60, type: 'work', ...(task ? { taskId: task.id } : {}) });
        return 25 * 60;
      }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(id);
  }, [createFocusSession, running, task]);
  const time = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  return <CompactShell widget={widget} onOpen={onOpen} icon={<Timer size={16} className="text-indigo-600" />}>
    <div className="flex min-h-0 flex-1 items-center gap-3"><div className="ff-compact-timer-ring"><span>{time}</span><small>Focus Time</small></div><div className="min-w-0 flex-1"><p className="truncate text-xs text-slate-500">{task?.title || 'No task selected'}</p><button type="button" data-no-drag onClick={() => setRunning((value) => !value)} className="ff-compact-primary mt-2 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-white">{running ? <Pause size={12} /> : <Play size={12} />}{running ? 'Pause' : 'Start'}</button></div></div>
  </CompactShell>;
}

function CompactWeather({ widget, onOpen }: CompactWidgetProps) {
  const city = typeof widget.config?.city === 'string' ? widget.config.city : '';
  const country = typeof widget.config?.country === 'string' ? widget.config.country : undefined;
  const { weather, isLoading, isDemo } = useWeather(city, country);
  return <CompactShell widget={widget} onOpen={onOpen} icon={<CloudSun size={16} className="text-indigo-600" />}>
    {isLoading ? <p className="text-xs text-slate-500">Loading weather…</p> : !weather.city ? <div className="flex min-h-0 flex-1 items-center text-xs text-slate-500">Choose a location to see weather.</div> : <div className="flex min-h-0 flex-1 items-center justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{weather.city}{weather.country ? ` · ${weather.country}` : ''}</p><p className="truncate text-xs capitalize text-slate-500">{weather.description}{isDemo ? ' · Demo' : ''}</p></div><div className="flex items-center gap-2"><WeatherIcon icon={weather.icon} className="text-2xl" /><strong className="text-2xl text-slate-900">{Math.round(weather.temp)}°C</strong></div><div className="hidden shrink-0 text-right text-[11px] text-slate-500 sm:block"><div>{weather.humidity}% Humidity</div><div>{weather.windSpeed} m/s Wind</div></div></div>}
  </CompactShell>;
}

function CompactCalendar({ widget, onOpen }: CompactWidgetProps) {
  const { data: tasks = [] } = useTasks();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const upcoming = tasks.filter((task) => task.dueDate && !task.isCompleted && new Date(task.dueDate) >= start && new Date(task.dueDate) <= end).sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '')).slice(0, 3);
  return <CompactShell widget={widget} onOpen={onOpen} icon={<CalendarDays size={16} className="text-indigo-600" />}>
    <div className="flex min-h-0 flex-1 flex-col justify-between"><div><strong className="block text-lg text-slate-900">{now.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</strong><span className="text-xs text-slate-500">{now.toLocaleDateString(undefined, { weekday: 'long' })}</span></div><div><p className="mb-1 text-[11px] font-medium text-slate-500">Next 7 days</p>{upcoming.length ? upcoming.map((task) => <div key={task.id} className="flex min-w-0 items-center justify-between gap-2 text-xs"><span className="flex min-w-0 items-center gap-1 truncate text-slate-700"><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} aria-label={`${task.priority} priority`} /><span className="truncate">{task.title}</span></span><span className="shrink-0 text-slate-400">{new Date(task.dueDate as string).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span></div>) : <span className="text-xs text-slate-500">No deadlines this week</span>}</div></div>
  </CompactShell>;
}

function CompactAnalytics({ widget, onOpen }: CompactWidgetProps) {
  const { data, isLoading } = useAnalytics('week');
  const metrics = [
    ['Productivity', data ? `${data.productivity}%` : '—', 'text-indigo-600'],
    ['Focus', data ? `${data.focusMinutes}m` : '—', 'text-cyan-600'],
    ['Tasks', data?.completedTasks ?? '—', 'text-emerald-600'],
    ['Goals', data?.completedGoals ?? '—', 'text-pink-600'],
  ] as const;
  return <CompactShell widget={widget} onOpen={onOpen} icon={<BarChart3 size={16} className="text-indigo-600" />}>
    {isLoading ? <p className="text-xs text-slate-500">Loading analytics…</p> : <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5">{metrics.map(([label, value, color]) => <div key={label} className="ff-compact-kpi"><span className={`block text-sm font-semibold ${color}`}>{value}</span><span className="text-[10px] text-slate-500">{label}</span></div>)}</div>}
  </CompactShell>;
}

function CompactNotes({ widget, onOpen }: CompactWidgetProps) {
  const { data: note, isFetched, isError } = useNote(widget.id);
  const { mutate: saveNote } = useSaveNote();
  const [content, setContent] = useState('');
  useEffect(() => { if (isFetched && !isError) setContent(note?.content ?? ''); }, [isError, isFetched, note?.content]);
  useEffect(() => { if (!isFetched || isError || content === (note?.content ?? '')) return; const id = window.setTimeout(() => saveNote({ widgetId: widget.id, content }), 600); return () => window.clearTimeout(id); }, [content, isError, isFetched, note?.content, saveNote, widget.id]);
  return <CompactShell widget={widget} onOpen={onOpen} icon={<StickyNote size={16} className="text-indigo-600" />}>
    <textarea data-no-drag aria-label="Notes" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a short note…" rows={3} className="min-h-0 flex-1 resize-none rounded-md border border-slate-200 bg-white/60 p-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200" />
  </CompactShell>;
}

function CompactGoals({ widget, onOpen }: CompactWidgetProps) {
  const { data: goals = [] } = useGoals();
  const { mutate: createGoal } = useCreateGoal();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const completed = goals.filter((goal) => goal.completed).length;
  const add = () => { if (!title.trim()) return; createGoal({ title: title.trim(), priority: 'medium' }); setTitle(''); setAdding(false); };
  return <CompactShell widget={widget} onOpen={onOpen} icon={<Target size={16} className="text-indigo-600" />}>
    <div className="min-h-0 flex-1"><div className="mb-2 flex items-center gap-2"><span className="ff-compact-progress flex-1"><span style={{ width: `${goals.length ? Math.round((completed / goals.length) * 100) : 0}%` }} /></span><span className="text-xs text-slate-500">{goals.length ? Math.round((completed / goals.length) * 100) : 0}%</span></div>{goals.length ? <div className="space-y-1">{goals.filter((goal) => !goal.completed).slice(0, 2).map((goal) => <div key={goal.id} className="flex min-w-0 items-center justify-between gap-2 text-xs"><span className="truncate text-slate-700">{goal.title}</span><span className="shrink-0 text-slate-400">{goal.priority}</span></div>)}</div> : <p className="text-xs text-slate-500">No goals yet</p>}{adding && <form data-no-drag onSubmit={(event) => { event.preventDefault(); add(); }} className="mt-1 flex gap-1"><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Goal title" className="min-w-0 flex-1 rounded border border-slate-200 px-1.5 py-1 text-xs" /><button type="submit" className="ff-compact-primary rounded px-2 text-xs text-white">Add</button></form>} {!adding && <button type="button" data-no-drag onClick={() => setAdding(true)} className="ff-compact-action mt-1 text-xs font-medium text-indigo-700"><Plus size={12} className="mr-0.5 inline" /> Add goal</button>}</div>
  </CompactShell>;
}

function CompactBookmarks({ widget, onOpen }: CompactWidgetProps) {
  const { data: bookmarks = [] } = useBookmarks();
  const { mutate: createBookmark } = useCreateBookmark();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const add = () => { if (!title.trim() || !url.trim()) return; createBookmark({ title: title.trim(), url: url.trim() }); setTitle(''); setUrl(''); setAdding(false); };
  return <CompactShell widget={widget} onOpen={onOpen} icon={<Bookmark size={16} className="text-indigo-600" />}>
    <div className="min-h-0 flex-1">{bookmarks.length ? <div className="space-y-1">{bookmarks.slice(0, 3).map((bookmark) => <a data-no-drag key={bookmark.id} href={bookmark.url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-slate-700 hover:text-indigo-700">{bookmark.title}<span className="ml-1 text-[10px] text-slate-400">{(() => { try { return new URL(bookmark.url).hostname; } catch { return ''; } })()}</span></a>)}</div> : <p className="text-xs text-slate-500">No bookmarks yet</p>}{adding && <form data-no-drag onSubmit={(event) => { event.preventDefault(); add(); }} className="mt-1 space-y-1"><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Bookmark title" placeholder="Title" className="w-full rounded border border-slate-200 px-1.5 py-1 text-xs" /><input value={url} onChange={(event) => setUrl(event.target.value)} aria-label="Bookmark URL" placeholder="URL" className="w-full rounded border border-slate-200 px-1.5 py-1 text-xs" /><button type="submit" className="ff-compact-primary rounded px-2 py-1 text-xs text-white">Add</button></form>}{!adding && <button type="button" data-no-drag onClick={() => setAdding(true)} className="ff-compact-action mt-1 text-xs font-medium text-indigo-700"><Plus size={12} className="mr-0.5 inline" /> Add</button>}</div>
  </CompactShell>;
}

export function CompactWidgetRenderer({ widget, onOpen }: CompactWidgetProps) {
  switch (widget.type) {
    case 'todo': return <CompactTasks widget={widget} onOpen={onOpen} />;
    case 'news': return <CompactNews widget={widget} onOpen={onOpen} />;
    case 'pomodoro': return <CompactPomodoro widget={widget} onOpen={onOpen} />;
    case 'weather': return <CompactWeather widget={widget} onOpen={onOpen} />;
    case 'calendar': return <CompactCalendar widget={widget} onOpen={onOpen} />;
    case 'analytics': return <CompactAnalytics widget={widget} onOpen={onOpen} />;
    case 'notes': return <CompactNotes widget={widget} onOpen={onOpen} />;
    case 'goals': return <CompactGoals widget={widget} onOpen={onOpen} />;
    case 'bookmarks': return <CompactBookmarks widget={widget} onOpen={onOpen} />;
  }
}
