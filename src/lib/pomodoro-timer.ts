export type PomodoroMode = 'work' | 'break' | 'longBreak';

export interface PomodoroSettings {
  workTime: number;
  breakTime: number;
  longBreakTime: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
}

export interface PomodoroDurations {
  work: number;
  break: number;
  longBreak: number;
}

export interface PomodoroState {
  mode: PomodoroMode;
  isRunning: boolean;
  remainingSeconds: number;
  endAt: number | null;
  startedAt: number | null;
  elapsedMilliseconds: number;
  durationSeconds: number;
  pomodoroCount: number;
  selectedTaskId: string;
  settings: PomodoroSettings;
}

export interface FocusSessionPayload {
  duration: number;
  type: 'work' | 'break' | 'long_break';
  taskId?: string;
}

export const defaultPomodoroSettings: PomodoroSettings = {
  workTime: 25,
  breakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  soundEnabled: true,
};

export const defaultPomodoroState: PomodoroState = {
  mode: 'work',
  isRunning: false,
  remainingSeconds: defaultPomodoroSettings.workTime * 60,
  endAt: null,
  startedAt: null,
  elapsedMilliseconds: 0,
  durationSeconds: defaultPomodoroSettings.workTime * 60,
  pomodoroCount: 0,
  selectedTaskId: '',
  settings: defaultPomodoroSettings,
};

export function durationsFromSettings(settings: PomodoroSettings): PomodoroDurations {
  return {
    work: settings.workTime * 60,
    break: settings.breakTime * 60,
    longBreak: settings.longBreakTime * 60,
  };
}

export function durationForMode(mode: PomodoroMode, settings: PomodoroSettings): number {
  return durationsFromSettings(settings)[mode];
}

export function getRemainingSeconds(endAt: number, now: number): number {
  return Math.max(0, Math.ceil((endAt - now) / 1000));
}

export function startPomodoro(state: PomodoroState, now: number): PomodoroState {
  return {
    ...state,
    isRunning: true,
    startedAt: now,
    endAt: now + Math.max(0, state.remainingSeconds) * 1000,
  };
}

export function pausePomodoro(state: PomodoroState, now: number): PomodoroState {
  const remainingSeconds = state.isRunning && state.endAt !== null
    ? getRemainingSeconds(state.endAt, now)
    : state.remainingSeconds;
  const startedAt = state.startedAt ?? (state.endAt === null ? now : state.endAt - state.durationSeconds * 1000);
  const elapsedMilliseconds = state.isRunning ? state.elapsedMilliseconds + Math.max(0, now - startedAt) : state.elapsedMilliseconds;

  return { ...state, isRunning: false, endAt: null, startedAt: null, elapsedMilliseconds, remainingSeconds };
}

export function resetPomodoro(state: PomodoroState): PomodoroState {
  const durationSeconds = durationForMode(state.mode, state.settings);
  return { ...state, isRunning: false, endAt: null, startedAt: null, elapsedMilliseconds: 0, remainingSeconds: durationSeconds, durationSeconds };
}

export function stopPomodoro(state: PomodoroState): PomodoroState {
  const durationSeconds = durationForMode('work', state.settings);
  return { ...state, mode: 'work', isRunning: false, endAt: null, startedAt: null, elapsedMilliseconds: 0, remainingSeconds: durationSeconds, durationSeconds };
}

export function skipPomodoro(state: PomodoroState): PomodoroState {
  const nextMode: PomodoroMode = state.mode === 'work'
    ? (state.pomodoroCount > 0 && state.pomodoroCount % state.settings.longBreakInterval === 0 ? 'longBreak' : 'break')
    : 'work';
  const durationSeconds = durationForMode(nextMode, state.settings);
  return { ...state, mode: nextMode, isRunning: false, endAt: null, startedAt: null, elapsedMilliseconds: 0, remainingSeconds: durationSeconds, durationSeconds };
}

export function completePomodoro(state: PomodoroState, now = Date.now()): { nextState: PomodoroState; completedMode: PomodoroMode; completedDuration: number } {
  const completedMode = state.mode;
  const completedDuration = state.durationSeconds;
  const pomodoroCount = completedMode === 'work' ? state.pomodoroCount + 1 : state.pomodoroCount;
  const nextMode: PomodoroMode = completedMode === 'work'
    ? (pomodoroCount % state.settings.longBreakInterval === 0 ? 'longBreak' : 'break')
    : 'work';
  const durationSeconds = durationForMode(nextMode, state.settings);
  const isRunning = completedMode === 'work' ? state.settings.autoStartBreaks : state.settings.autoStartPomodoros;

  return {
    completedMode,
    completedDuration,
    nextState: {
      ...state,
      mode: nextMode,
      isRunning,
      startedAt: isRunning ? now : null,
      endAt: isRunning ? now + durationSeconds * 1000 : null,
      elapsedMilliseconds: 0,
      remainingSeconds: durationSeconds,
      durationSeconds,
      pomodoroCount,
    },
  };
}

export function focusSessionPayloadForCompletion(
  state: PomodoroState,
  completedMode = state.mode,
  completedDuration = state.durationSeconds,
): FocusSessionPayload {
  return {
    duration: completedDuration,
    type: completedMode === 'longBreak' ? 'long_break' : completedMode,
    ...(completedMode === 'work' && state.selectedTaskId ? { taskId: state.selectedTaskId } : {}),
  };
}

export function updatePomodoroSettings(state: PomodoroState, patch: Partial<PomodoroSettings>): PomodoroState {
  const settings = { ...state.settings, ...patch };
  const previousDuration = durationForMode(state.mode, state.settings);
  const durationSeconds = durationForMode(state.mode, settings);
  const isFreshSession = !state.isRunning && state.elapsedMilliseconds === 0 && state.remainingSeconds === previousDuration;
  const remainingSeconds = isFreshSession
    ? durationSeconds
    : state.remainingSeconds;
  return { ...state, settings, remainingSeconds, durationSeconds: isFreshSession ? durationSeconds : state.durationSeconds };
}

/** Returns active focus time only; paused intervals are excluded. */
export function getElapsedFocusSeconds(state: PomodoroState, now: number): number {
  if (state.mode !== 'work') return 0;
  const activeMilliseconds = state.elapsedMilliseconds + (state.isRunning && state.startedAt !== null
    ? Math.max(0, now - state.startedAt)
    : 0);
  return Math.min(state.durationSeconds, Math.max(0, Math.floor(activeMilliseconds / 1000)));
}

export function createCompletionGate() {
  let completedEndAt: number | null = null;
  return (endAt: number) => {
    if (completedEndAt === endAt) return false;
    completedEndAt = endAt;
    return true;
  };
}
