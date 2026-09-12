'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  BarChart3,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudSun,
  Clock3,
  Droplet,
  Flag,
  Github,
  Bell,
  Settings,
  Newspaper,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Square,
  Target,
  Timer,
  TrendingUp,
  StickyNote,
  Youtube,
  Wind,
} from 'lucide-react';
import { AnimatedWidget } from '@/components/animated-widget';
import { WeatherArtScene } from '@/components/weather-art-scene';
import { useAnalytics } from '@/hooks/use-analytics';
import { useNews } from '@/hooks/use-news';
import { useTasks } from '@/hooks/use-tasks';
import { useWeather } from '@/hooks/useWeather';
import { getWeatherDisplayName } from '@/lib/weather-location';
import { getTargetLocationDate } from '@/lib/weather-visual';
import { useBookmarks, useCreateBookmark, useCreateGoal, useGoals, useNote, useSaveNote } from '@/hooks/use-personal-widgets';
import { usePomodoro } from '@/contexts/pomodoro-context';
import type { Widget, WidgetType } from '@/types/dashboard';
import type { Task } from '@/types/task';

interface CompactWidgetProps {
  widget: Widget;
  onOpen: () => void;
}

export const compactPresentationLimits = { news: 2, bookmarks: 3, goals: 2, relevantTasks: 1 } as const;

export function shouldOpenCompactFocusView(targetIsInteractive: boolean, didMove: boolean): boolean {
  return !targetIsInteractive && !didMove;
}

export function compactPomodoroControlAction(isRunning: boolean, hasSelectedTask: boolean): 'pause' | 'start' | 'open' {
  if (isRunning) return 'pause';
  return hasSelectedTask ? 'start' : 'open';
}

function CompactShell({ widget, onOpen, icon, children }: CompactWidgetProps & { icon: ReactNode; children: ReactNode }) {
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);
  const label = labelForType(widget.type);

  const isInteractiveTarget = (target: EventTarget | null) => target instanceof HTMLElement && Boolean(target.closest('button, input, textarea, select, a, [data-no-drag]'));
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isInteractiveTarget(event.target)) return;
    pointerRef.current = { x: event.clientX, y: event.clientY };
    suppressClickRef.current = false;
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerRef.current) return;
    if (Math.hypot(event.clientX - pointerRef.current.x, event.clientY - pointerRef.current.y) > 6) suppressClickRef.current = true;
  };
  const handlePointerUp = () => {
    window.requestAnimationFrame(() => { pointerRef.current = null; });
  };
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldOpenCompactFocusView(isInteractiveTarget(event.target), suppressClickRef.current)) {
      suppressClickRef.current = false;
      return;
    }
    onOpen();
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.key === 'Enter' || event.key === ' ') && !isInteractiveTarget(event.target)) {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <AnimatedWidget className={`ff-compact-card ff-compact-card-${widget.type}`}>
      <div
        className="ff-compact-object ff-compact-drag-surface flex h-full min-h-0 flex-col"
        aria-label={`Open ${label} Focus View`}
        aria-labelledby={`${widget.id}-compact-label`}
        role="group"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <h3 id={`${widget.id}-compact-label`} className="sr-only">{widget.title || label}</h3>
        <span className="sr-only">{icon}</span>
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

export function getCompactCalendarGrid(date: Date, _locale?: string): CompactCalendarGrid {
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
    new Date(2021, 10, 1 + index).toLocaleDateString('en-US', { weekday: 'narrow' }),
  );

  return {
    monthLabel: date.toLocaleDateString('en-US', { month: 'long' }),
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
          {([['To Do', summary.counts.todo, 'todo'], ['In Progress', summary.counts.in_progress, 'in-progress'], ['Done', summary.counts.done, 'done']] as const).map(([label, count, status]) => (
            <div key={label}>
              <span className="ff-compact-status-label">{label}</span>
              <span className={`ff-compact-status-badge ff-compact-status-badge-${status}`}>{count}</span>
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
  const { articles, loading } = useNews('general');
  return <CompactShell widget={widget} onOpen={onOpen} icon={<Newspaper size={16} className="text-indigo-600" />}>
    <div className="ff-compact-news-object">
      {loading ? <p className="text-xs text-slate-500">Loading headlines…</p> : articles.slice(0, compactPresentationLimits.news).map((article, index) => <a data-no-drag key={`${article.title}-${index}`} href={article.url} target="_blank" rel="noopener noreferrer" className="ff-compact-news-story">
        {article.image ? (
          // News image URLs come from the provider and are intentionally rendered without a remote Next image allowlist.
          // eslint-disable-next-line @next/next/no-img-element
          <span className="ff-compact-news-image-wrap"><img className="ff-compact-news-image" src={article.image} alt="" /></span>
        ) : <span className="ff-compact-news-index">0{index + 1}</span>}
        <span className="min-w-0">
          <strong className="ff-compact-news-headline">{article.title}</strong>
          <span className="ff-compact-news-meta">{article.source} · {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </span>
        <ChevronRight className="ff-compact-news-chevron" size={15} aria-hidden="true" />
      </a>)}
    </div>
  </CompactShell>;
}

function CompactPomodoro({ widget, onOpen }: CompactWidgetProps) {
  const { state, startTimer, pauseTimer, stopTimer, resetTimer, skipToNext } = usePomodoro();
  const { data: tasks = [] } = useTasks();
  const { mode, isRunning, remainingSeconds, selectedTaskId } = state;
  const task = tasks.find((candidate) => candidate.id === selectedTaskId);
  const time = `${Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}`;
  return <CompactShell widget={widget} onOpen={onOpen} icon={<Timer size={16} className="text-indigo-600" />}>
    <div className="ff-compact-pomodoro-body">
      <div className="ff-compact-pomodoro-tools" data-no-drag>
        <button type="button" onClick={(event) => { event.stopPropagation(); onOpen(); }} aria-label="Open Pomodoro sound settings" title="Sound settings"><Bell size={13} /></button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onOpen(); }} aria-label="Open Pomodoro settings" title="Pomodoro settings"><Settings size={13} /></button>
      </div>
      <div className="ff-compact-timer-ring ff-compact-timer-ring-large" role="timer" aria-label={`${time}, ${task?.title || 'No task selected'}`}>
        <span>{time}</span>
        {task ? <small
          data-no-drag
          role="button"
          tabIndex={0}
          onClick={(event) => { event.stopPropagation(); onOpen(); }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              onOpen();
            }
          }}
        >{task.title}</small> : <small>No task selected</small>}
        <button type="button" data-no-drag onClick={(event) => { event.stopPropagation(); skipToNext(); }} className="ff-compact-action ff-compact-skip">Skip to {mode === 'work' ? 'break' : 'work'} <ChevronRight size={11} aria-hidden="true" /></button>
      </div>
      <div className="ff-compact-pomodoro-controls" data-no-drag>
        <button type="button" onClick={(event) => { event.stopPropagation(); resetTimer(); }} aria-label="Reset focus timer" title="Reset"><RotateCcw size={15} /></button>
        <button type="button" onClick={(event) => { event.stopPropagation(); const action = compactPomodoroControlAction(isRunning, Boolean(task)); if (action === 'pause') pauseTimer(); else if (action === 'start') startTimer(); else onOpen(); }} aria-label={isRunning ? 'Pause focus timer' : 'Start focus timer'} title={isRunning ? 'Pause' : 'Start'}>{isRunning ? <Pause size={16} /> : <Play size={16} />}</button>
        <button type="button" onClick={(event) => { event.stopPropagation(); stopTimer(); }} aria-label="Stop focus timer" title="Stop"><Square size={15} /></button>
      </div>
    </div>
  </CompactShell>;
}

function CompactWeather({ widget, onOpen }: CompactWidgetProps) {
  const city = typeof widget.config?.city === 'string' ? widget.config.city : '';
  const country = typeof widget.config?.country === 'string' ? widget.config.country : undefined;
  const { weather, isLoading, isDemo } = useWeather(city, country);
  const targetWeatherDate = getTargetLocationDate(new Date(), weather.location?.timezone ?? 0);
  return <CompactShell widget={widget} onOpen={onOpen} icon={<CloudSun size={16} className="text-indigo-600" />}>
    {isLoading ? <p className="text-xs text-slate-500">Loading weather…</p> : !weather.city ? <div className="ff-compact-weather-empty">Choose a location to see weather.</div> : <div className="ff-compact-weather-object"><WeatherArtScene condition={weather.condition} isDay={weather.isDay} icon={weather.icon} conditionCode={weather.conditionCode} date={targetWeatherDate} variant="compact" className="ff-compact-weather-main"><div className="ff-compact-weather-copy min-w-0"><strong className="ff-compact-weather-temperature block leading-none text-slate-900">{Math.round(weather.temp)}°C</strong><p className="mt-1 truncate text-sm font-medium text-slate-800">{getWeatherDisplayName(weather.city)}</p><p className="truncate text-xs capitalize text-slate-500">{weather.description}{isDemo ? ' · Demo' : ''}</p></div></WeatherArtScene><div className="ff-compact-weather-meta"><span><Droplet size={15} aria-hidden="true" />{weather.humidity}%</span><span><Wind size={15} aria-hidden="true" />{weather.windSpeed} m/s</span></div></div>}
  </CompactShell>;
}

function CompactCalendar({ widget, onOpen }: CompactWidgetProps) {
  const { data: tasks = [] } = useTasks();
  const [displayDate, setDisplayDate] = useState(() => new Date());
  const now = new Date();
  const calendar = getCompactCalendarGrid(displayDate);
  const shiftMonth = (offset: number) => setDisplayDate((date) => new Date(date.getFullYear(), date.getMonth() + offset, 1));
  return <CompactShell widget={widget} onOpen={onOpen} icon={<CalendarDays size={16} className="text-indigo-600" />}>
    <div className="ff-compact-calendar" aria-label={calendar.monthLabel}>
      <div className="ff-compact-calendar-month"><button type="button" data-no-drag onClick={() => shiftMonth(-1)} aria-label="Previous month"><ChevronLeft size={13} /></button><span>{calendar.monthLabel}</span><button type="button" data-no-drag onClick={() => shiftMonth(1)} aria-label="Next month"><ChevronRight size={13} /></button></div>
      <div className="ff-compact-calendar-weekdays" aria-hidden="true">{calendar.weekdayLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div>
      <div className="ff-compact-calendar-grid">
        {calendar.cells.map((day, index) => {
          if (day === null) return <span key={`empty-${index}`} className="ff-compact-calendar-cell ff-compact-calendar-cell-empty" aria-hidden="true" />;
          const priority = priorityForCalendarDay(tasks, calendar.year, calendar.month, day);
          const isToday = calendar.year === now.getFullYear() && calendar.month === now.getMonth() && day === now.getDate();
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
    ['Productivity', data ? `${data.productivity}%` : '—', 'text-indigo-600', TrendingUp],
    ['Focus', data ? `${data.focusMinutes}m` : '—', 'text-cyan-600', Clock3],
    ['Tasks', data?.completedTasks ?? '—', 'text-emerald-600', CheckCircle2],
    ['Goals', data?.completedGoals ?? '—', 'text-pink-600', Target],
  ] as const;
  return <CompactShell widget={widget} onOpen={onOpen} icon={<BarChart3 size={16} className="text-indigo-600" />}>
    {isLoading ? <p className="text-xs text-slate-500">Loading analytics…</p> : <div className="ff-compact-analytics-grid">{metrics.map(([label, value, color, Icon]) => <div key={label} className="ff-compact-kpi"><Icon size={15} className={`ff-compact-kpi-icon ${color}`} aria-hidden="true" /><span className={`ff-compact-kpi-value ${color}`}>{value}</span><span className="ff-compact-kpi-label text-[10px] text-slate-500">{label}</span></div>)}</div>}
  </CompactShell>;
}

function CompactNotes({ widget, onOpen }: CompactWidgetProps) {
  const { data: note, isFetched, isError } = useNote(widget.id);
  const { mutate: saveNote } = useSaveNote();
  const [content, setContent] = useState('');
  useEffect(() => { if (isFetched && !isError) setContent(note?.content ?? ''); }, [isError, isFetched, note?.content]);
  useEffect(() => { if (!isFetched || isError || content === (note?.content ?? '')) return; const id = window.setTimeout(() => saveNote({ widgetId: widget.id, content }), 600); return () => window.clearTimeout(id); }, [content, isError, isFetched, note?.content, saveNote, widget.id]);
  return <CompactShell widget={widget} onOpen={onOpen} icon={<StickyNote size={16} className="text-indigo-600" />}>
    <div className="ff-compact-note-paper"><textarea data-no-drag aria-label="Notes" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a short note…" rows={3} className="ff-compact-note-editor min-h-0 flex-1 resize-none bg-transparent p-0 text-xs text-slate-700 outline-none" /></div>
  </CompactShell>;
}

function CompactGoals({ widget, onOpen }: CompactWidgetProps) {
  const { data: goals = [] } = useGoals();
  const completed = goals.filter((goal) => goal.completed).length;
  const completion = goals.length ? Math.round((completed / goals.length) * 100) : 0;
  const arcs = [34, 28, 22].map((radius) => 2 * Math.PI * radius);
  return <CompactShell widget={widget} onOpen={onOpen} icon={<Target size={16} className="text-indigo-600" />}>
    <div className="ff-compact-goals-object"><div className="ff-compact-goals-ring"><svg viewBox="0 0 76 76" aria-hidden="true"><circle className="ff-compact-goals-outer" cx="38" cy="38" r="34" strokeDasharray={arcs[0]} strokeDashoffset={arcs[0] * (1 - completion / 100)} /><circle className="ff-compact-goals-middle" cx="38" cy="38" r="28" strokeDasharray={arcs[1]} strokeDashoffset={arcs[1] * (1 - (completion / 100) * 0.86)} /><circle className="ff-compact-goals-inner" cx="38" cy="38" r="22" strokeDasharray={arcs[2]} strokeDashoffset={arcs[2] * (1 - (completion / 100) * 0.68)} /></svg><span className="ff-compact-goals-center"><strong>{completion}%</strong></span></div><div className="ff-compact-goals-list">{goals.length ? goals.filter((goal) => !goal.completed).slice(0, compactPresentationLimits.goals).map((goal) => <div key={goal.id} className="ff-compact-goal-row"><span className={`ff-compact-goal-dot ff-compact-goal-${goal.priority}`} aria-hidden="true" /><span className="ff-compact-goal-copy"><span className="truncate">{goal.title}</span><small>Active</small></span></div>) : <p>No goals yet</p>}</div></div>
  </CompactShell>;
}

function bookmarkSiteIcon(url: string): ReactNode {
  let hostname = '';
  try { hostname = new URL(url).hostname.toLowerCase(); } catch { return null; }
  if (hostname === 'github.com' || hostname.endsWith('.github.com')) return <Github size={15} aria-hidden="true" />;
  if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com')) return <Youtube size={15} aria-hidden="true" />;
  if (hostname === 'cloud.google.com' || hostname.endsWith('.google.com')) return <Cloud size={15} aria-hidden="true" />;
  return null;
}

function CompactBookmarks({ widget, onOpen }: CompactWidgetProps) {
  const { data: bookmarks = [] } = useBookmarks();
  const { mutate: createBookmark } = useCreateBookmark();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const add = () => { if (!title.trim() || !url.trim()) return; createBookmark({ title: title.trim(), url: url.trim() }); setTitle(''); setUrl(''); setAdding(false); };
  return <CompactShell widget={widget} onOpen={onOpen} icon={<Bookmark size={16} className="text-indigo-600" />}>
    <div className="ff-compact-bookmarks-object">{bookmarks.length ? <div className="ff-compact-bookmark-list">{bookmarks.slice(0, compactPresentationLimits.bookmarks).map((bookmark) => <a data-no-drag key={bookmark.id} href={bookmark.url} target="_blank" rel="noopener noreferrer" className="ff-compact-bookmark-row">{bookmarkSiteIcon(bookmark.url)}<span className="min-w-0 truncate"><strong>{bookmark.title}</strong><small>{(() => { try { return new URL(bookmark.url).hostname; } catch { return ''; } })()}</small></span><ChevronRight size={13} aria-hidden="true" /></a>)}</div> : <p className="text-xs text-slate-500">No bookmarks yet</p>}{adding && <form data-no-drag onSubmit={(event) => { event.preventDefault(); add(); }} className="mt-1 space-y-1"><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Bookmark title" placeholder="Title" className="w-full rounded border border-slate-200 px-1.5 py-1 text-xs" /><input value={url} onChange={(event) => setUrl(event.target.value)} aria-label="Bookmark URL" placeholder="URL" className="w-full rounded border border-slate-200 px-1.5 py-1 text-xs" /><button type="submit" className="ff-compact-primary rounded px-2 py-1 text-xs text-white">Add</button></form>}{!adding && <button type="button" data-no-drag onClick={() => setAdding(true)} className="ff-compact-action mt-1 text-xs font-medium text-indigo-700"><Plus size={12} className="mr-0.5 inline" /> Add</button>}</div>
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
