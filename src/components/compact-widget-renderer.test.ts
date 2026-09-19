import { describe, expect, it } from 'vitest';
import { compactPomodoroControlAction, compactPresentationLimits, compactWeatherPageCount, formatCompactForecastTime, getCompactCalendarGrid, initialCompactWeatherPage, isCompactInteractiveTarget, nextCompactWeatherPage, previousCompactWeatherPage, shouldOpenCompactFocusView, shouldResetCompactWeatherPage, summarizeCompactTasks } from './compact-widget-renderer';
import type { Task } from '@/types/task';

const task = (overrides: Partial<Task>): Task => ({
  id: 'task-1',
  title: 'Task',
  description: null,
  priority: 'medium',
  dueDate: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  isCompleted: false,
  status: 'todo',
  ...overrides,
});

describe('compact widget presentation helpers', () => {
  it('summarizes statuses and keeps one nearest unfinished task', () => {
    const result = summarizeCompactTasks([
      task({ id: 'done', status: 'done', isCompleted: true }),
      task({ id: 'later', title: 'Later', dueDate: '2026-09-20T00:00:00.000Z', priority: 'low' }),
      task({ id: 'soon', title: 'Soon', dueDate: '2026-09-12T00:00:00.000Z', priority: 'high', status: 'in_progress' }),
    ]);

    expect(result.completed).toBe(1);
    expect(result.total).toBe(3);
    expect(result.counts).toEqual({ todo: 1, in_progress: 1, done: 1 });
    expect(result.relevantTask?.id).toBe('soon');
  });

  it('builds an English Monday-first month grid without a year label', () => {
    const grid = getCompactCalendarGrid(new Date(2026, 8, 11), 'ru-RU');

    expect(grid.monthLabel).toBe('September');
    expect(grid.weekdayLabels).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
    expect(grid.cells).toHaveLength(35);
  });

  it('keeps compact content intentionally bounded', () => {
    expect(compactPresentationLimits).toEqual({ news: 2, bookmarks: 3, goals: 2, relevantTasks: 1 });
  });

  it('opens Focus View only for a click on a non-interactive tile surface', () => {
    expect(shouldOpenCompactFocusView(false, false)).toBe(true);
    expect(shouldOpenCompactFocusView(true, false)).toBe(false);
    expect(shouldOpenCompactFocusView(false, true)).toBe(false);
  });

  it('treats SVG descendants of controls as interactive targets', () => {
    const svgPath = { closest: (selector: string) => selector.includes('button') ? {} : null } as unknown as EventTarget;
    expect(isCompactInteractiveTarget(svgPath)).toBe(true);
    expect(shouldOpenCompactFocusView(isCompactInteractiveTarget(svgPath), false)).toBe(false);
  });

  it('starts or resumes compact Pomodoro in place only when a selected task exists', () => {
    expect(compactPomodoroControlAction(false, true)).toBe('start');
    expect(compactPomodoroControlAction(true, true)).toBe('pause');
    expect(compactPomodoroControlAction(false, false)).toBe('open');
    expect(compactPomodoroControlAction(true, false)).toBe('pause');
  });

  it('starts compact Weather on Current and loops forward and backward through three pages', () => {
    expect(initialCompactWeatherPage).toBe(0);
    expect(compactWeatherPageCount).toBe(3);
    expect(nextCompactWeatherPage(0)).toBe(1);
    expect(nextCompactWeatherPage(2)).toBe(0);
    expect(previousCompactWeatherPage(0)).toBe(2);
    expect(previousCompactWeatherPage(2)).toBe(1);
  });

  it('resets compact Weather paging only when the canonical location changes', () => {
    expect(shouldResetCompactWeatherPage('50.8:4.3', '50.8:4.3')).toBe(false);
    expect(shouldResetCompactWeatherPage('50.8:4.3', '52.4:4.9')).toBe(true);
  });

  it('formats forecast times from the existing location timezone', () => {
    expect(formatCompactForecastTime(Date.UTC(2026, 8, 19, 10, 0, 0) / 1000, 7200)).toBe('12:00');
  });
});
