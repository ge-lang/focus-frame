import { describe, expect, it } from 'vitest';
import {
  completePomodoro,
  createCompletionGate,
  defaultPomodoroState,
  getRemainingSeconds,
  pausePomodoro,
  skipPomodoro,
  startPomodoro,
} from './pomodoro-timer';

describe('shared Pomodoro timer state', () => {
  it('derives remaining time from the timestamp using ceil and clamps at zero', () => {
    expect(getRemainingSeconds(10_000, 8_501)).toBe(2);
    expect(getRemainingSeconds(10_000, 10_000)).toBe(0);
    expect(getRemainingSeconds(10_000, 11_000)).toBe(0);
  });

  it('starts and pauses from the same canonical endAt value', () => {
    const started = startPomodoro(defaultPomodoroState, 100_000);
    expect(started).toMatchObject({ isRunning: true, endAt: 1_600_000 });

    const paused = pausePomodoro(started, 101_500);
    expect(paused).toMatchObject({ isRunning: false, endAt: null, remainingSeconds: 1_499 });
  });

  it('transitions to the next mode without creating a second timer state', () => {
    const next = skipPomodoro({ ...defaultPomodoroState, selectedTaskId: 'task-1' });
    expect(next).toMatchObject({ mode: 'break', remainingSeconds: 300, selectedTaskId: 'task-1', isRunning: false });
  });

  it('records one completion for one endAt even if the tick is observed twice', () => {
    const gate = createCompletionGate();
    expect(gate(42_000)).toBe(true);
    expect(gate(42_000)).toBe(false);

    const completed = completePomodoro({
      ...defaultPomodoroState,
      isRunning: true,
      endAt: 42_000,
      remainingSeconds: 0,
    }, 42_000);
    expect(completed.completedMode).toBe('work');
    expect(completed.completedDuration).toBe(1_500);
    expect(completed.nextState).toMatchObject({ mode: 'break', pomodoroCount: 1, remainingSeconds: 300 });
  });
});
