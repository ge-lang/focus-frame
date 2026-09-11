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
  RotateCcw,
  SkipForward,
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

const compactPomodoroDurations = { work: 25 * 60, break: 5 * 60, longBreak: 15 * 60 } as const;

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

export interface CompactTaskSummary {
  completed: number;
  total: number;
  counts: { todo: number; in_progress: number; done: number };
  relevantTask?: Task;
}

export function summarizeCompactTasks(tasks: Task[]): CompactTaskSummary {
  return {
    completed: tasks.filter((task) => task.isCompleted || task.status === 'done').length,
    total: tasks.length,
    counts: {
      todo: tasks.filter((task) => task.status === 'todo').length,
      in_progress: tasks.filter((task) => task.status === 'in_progress').length,
      done: tasks.filter((task) => task.status === 'done' || task.isCompleted).length,
    },
    relevantTask: relevantTask(tasks),
  };
}

function compactDeadlineLabel(dueDate: string | null) {
  if (!dueDate) return null;
  return new Date(dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export interface CompactCalendarGrid {
  monthLabel: string;
  weekdayLabels: string[];
  cells: Array<number | null>;
  year: number;
  month: number;
}

export function getCompactCalendarGrid(date: Date, locale?: string): CompactCalendarGrid {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstDayOffset + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
    new Date(2021, 10, 1 + index).toLocaleDateString(locale, { weekday: 'narrow' }),
  );

  return {
    monthLabel: date.toLocaleDateString(locale, { month: 'long', year: 'numeric' }),
    weekdayLabels,
    cells,
    year,
    month,
  };
}

function priorityForCalendarDay(tasks: Task[], year: number, month: number, day: number) {
  const priorities: Task['priority'][] = ['high', 'medium', 'low'];
  const matching = tasks.filter((task) => {
    if (!task.dueDate || task.isCompleted || task.status === 'done') return false;
    const dueDate = new Date(`${task.dueDate.slice(0, 10)}T00:00:00`);
    return dueDate.getFullYear() === year && dueDate.getMonth() === month && dueDate.getDate() === day;
  });
  return priorities.find((priority) => matching.some((task) => task.priority === priority));
}

function CompactTasks({ widget, onOpen }: CompactWidgetProps) {
  const { data: tasks = [] } = useTasks();
  const summary = summarizeCompactTasks(tasks);
  const completion = summary.total ? summary.completed / summary.total : 0;
  const circumference = 2 * Math.PI * 18;
  const allCompleted = summary.total > 0 && summary.completed === summary.total;

  return (
    <CompactShell widget={widget} onOpen={onOpen} icon={<CheckCircle2 size={16} className="text-indigo-600" />}>
      <div className="ff-compact-task-body">
        <div className="ff-compact-status-summary" aria-label="Task status summary">
          {([['To Do', summary.counts.todo], ['In Progress', summary.counts.in_progress], ['Done', summary.counts.done]] as const).map(([label, count]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>

        <div className="ff-compact-task-completion" aria-label={`${summary.completed} of ${summary.total} tasks completed`}>
          <div className="ff-compact-task-progress-ring">
            <svg viewBox="0 0 44 44" aria-hidden="true">
              <circle className="ff-compact-task-progress-track" cx="22" cy="22" r="18" />
              <circle
                className="ff-compact-task-progress-value"
                cx="22"
                cy="22"
                r="18"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - completion)}
              />
            </svg>
            <div className="ff-compact-task-progress-label">
              <strong>{summary.completed}/{summary.total}</strong>
              <span>completed</span>
            </div>
          </div>
          {allCompleted && <CheckCircle2 size={16} className="text-emerald-500" aria-label="All tasks completed" />}
        </div>

        {summary.relevantTask ? (
          <div className="ff-compact-relevant-task" title={summary.relevantTask.title}>
            <Flag size={12} className={`shrink-0 ${summary.relevantTask.priority === 'high' ? 'text-rose-400' : summary.relevantTask.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`} aria-hidden="true" />
            <span className="truncate text-xs font-medium text-slate-800">{summary.relevantTask.title}</span>
            {compactDeadlineLabel(summary.relevantTask.dueDate) && <time className="shrink-0 text-[11px] text-slate-500">{compactDeadlineLabel(summary.relevantTask.dueDate)}</time>}
          </div>
        ) : <p className="text-center text-xs text-slate-500">No unfinished tasks</p>}
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
  const [mode, setMode] = useState<'work' | 'break' | 'longBreak'>('work');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const { data: tasks = [] } = useTasks();
  const { mutate: createFocusSession } = useCreateFocusSession();
  const task = tasks.find((candidate) => !candidate.isCompleted && candidate.status !== 'done');
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((value) => {
      if (value <= 1) {
        setRunning(false);
        if (mode === 'work') {
          createFocusSession({ duration: compactPomodoroDurations.work, type: 'work', ...(task ? { taskId: task.id } : {}) });
          const nextCount = pomodoroCount + 1;
          setPomodoroCount(nextCount);
          const nextMode = nextCount % 4 === 0 ? 'longBreak' : 'break';
          setMode(nextMode);
          return compactPomodoroDurations[nextMode];
        }
        setMode('work');
        return compactPomodoroDurations.work;
      }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(id);
  }, [createFocusSession, mode, pomodoroCount, running, task]);

  const resetTimer = () => {
    setRunning(false);
    setSeconds(compactPomodoroDurations[mode]);
  };

  const skipToNext = () => {
    setRunning(false);
    if (mode === 'work') {
      const nextMode = pomodoroCount > 0 && pomodoroCount % 4 === 0 ? 'longBreak' : 'break';
      setMode(nextMode);
      setSeconds(compactPomodoroDurations[nextMode]);
    } else {
      setMode('work');
      setSeconds(compactPomodoroDurations.work);
    }
  };

  const time = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  return <CompactShell widget={widget} onOpen={onOpen} icon={<Timer size={16} className="text-indigo-600" />}>
    <div className="ff-compact-pomodoro-body">
      <div className="ff-compact-timer-ring ff-compact-timer-ring-large" role="timer" aria-label={`${time}, ${task?.title || 'No task selected'}`}>
        <span>{time}</span>
        <small>{task?.title || 'No task selected'}</small>
      </div>
      <div className="ff-compact-pomodoro-controls" data-no-drag>
        <button type="button" onClick={() => setRunning((value) => !value)} aria-label={running ? 'Pause focus timer' : 'Start focus timer'} title={running ? 'Pause' : 'Start'}>{running ? <Pause size={13} /> : <Play size={13} />}</button>
        <button type="button" onClick={resetTimer} aria-label="Reset focus timer" title="Reset"><RotateCcw size={13} /></button>
        <button type="button" onClick={skipToNext} aria-label={mode === 'work' ? 'Skip to break' : 'Skip to work'} title={mode === 'work' ? 'Skip to break' : 'Skip to work'}><SkipForward size={13} /></button>
      </div>
      <button type="button" data-no-drag onClick={skipToNext} className="ff-compact-action ff-compact-skip">Skip to {mode === 'work' ? 'break' : 'work'}</button>
    </div>
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
  const calendar = getCompactCalendarGrid(now);
  return <CompactShell widget={widget} onOpen={onOpen} icon={<CalendarDays size={16} className="text-indigo-600" />}>
    <div className="ff-compact-calendar" aria-label={calendar.monthLabel}>
      <div className="ff-compact-calendar-month">{calendar.monthLabel}</div>
      <div className="ff-compact-calendar-weekdays" aria-hidden="true">{calendar.weekdayLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div>
      <div className="ff-compact-calendar-grid">
        {calendar.cells.map((day, index) => {
          if (day === null) return <span key={`empty-${index}`} className="ff-compact-calendar-cell ff-compact-calendar-cell-empty" aria-hidden="true" />;
          const priority = priorityForCalendarDay(tasks, calendar.year, calendar.month, day);
          const isToday = day === now.getDate();
          const label = `${calendar.monthLabel} ${day}${priority ? `, ${priority} priority deadline` : ''}${isToday ? ', today' : ''}`;
          return <span key={day} className={`ff-compact-calendar-cell ${isToday ? 'ff-compact-calendar-cell-today' : ''}`} aria-current={isToday ? 'date' : undefined} aria-label={label} title={label}>{day}{priority && <span className={`ff-compact-calendar-dot ff-compact-calendar-dot-${priority}`} aria-hidden="true" />}</span>;
        })}
      </div>
    </div>
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
