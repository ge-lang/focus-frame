'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useCreateFocusSession } from '@/hooks/use-analytics';
import { useUserSettings } from '@/hooks/use-settings';
import { showToast } from '@/lib/toast';
import {
  completePomodoro,
  createCompletionGate,
  defaultPomodoroState,
  focusSessionPayloadForCompletion,
  getElapsedFocusSeconds,
  getRemainingSeconds,
  pausePomodoro,
  resetPomodoro,
  skipPomodoro,
  startPomodoro,
  stopPomodoro,
  updatePomodoroSettings,
  type PomodoroSettings,
  type PomodoroState,
} from '@/lib/pomodoro-timer';

interface PomodoroContextValue {
  state: PomodoroState;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  skipToNext: () => void;
  selectTask: (taskId: string) => void;
  updateSettings: (patch: Partial<PomodoroSettings>) => void;
  setSoundEnabled: (enabled: boolean) => void;
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PomodoroState>(defaultPomodoroState);
  const stateRef = useRef(state);
  const audioContextRef = useRef<AudioContext | null>(null);
  const completionGateRef = useRef(createCompletionGate());
  const pendingCompletionEndAtRef = useRef<number | null>(null);
  const { mutateAsync: createFocusSessionAsync } = useCreateFocusSession();
  const { data: userSettings } = useUserSettings();

  const commitState = useCallback((nextState: PomodoroState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  useEffect(() => {
    const initializeAudio = () => {
      if (audioContextRef.current) return;
      const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextConstructor) audioContextRef.current = new AudioContextConstructor();
    };
    document.addEventListener('click', initializeAudio, { once: true });
    return () => document.removeEventListener('click', initializeAudio);
  }, []);

  const playNotificationSound = useCallback(() => {
    if (!stateRef.current.settings.soundEnabled || !audioContextRef.current) return;
    try {
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (error) {
      console.log('Sound playback error:', error);
    }
  }, []);

  const completeTimer = useCallback((expectedEndAt: number) => {
    const current = stateRef.current;
    if (!current.isRunning || current.endAt !== expectedEndAt || !completionGateRef.current(expectedEndAt)) return;

    playNotificationSound();
    if (userSettings?.notificationsEnabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(current.mode === 'work' ? 'Focus session completed' : 'Break completed', {
        body: current.mode === 'work' ? 'Great work. Time for a break.' : 'Ready for another focus session?',
      });
    }
    const completedAt = Date.now();
    const { nextState, completedMode, completedDuration } = completePomodoro(current, completedAt);
    const session = focusSessionPayloadForCompletion(current, completedMode, completedDuration);
    pendingCompletionEndAtRef.current = expectedEndAt;

    void createFocusSessionAsync(session)
      .catch((error: unknown) => {
        console.error('Failed to persist completed focus session:', error);
        showToast('Focus session could not be saved. Check your connection and try again.', 'error');
      })
      .finally(() => {
        pendingCompletionEndAtRef.current = null;
        commitState(nextState);
      });
  }, [commitState, createFocusSessionAsync, playNotificationSound, userSettings?.notificationsEnabled]);

  useEffect(() => {
    if (!state.isRunning || state.endAt === null) return;
    const tick = () => {
      const current = stateRef.current;
      if (!current.isRunning || current.endAt === null) return;
      const remainingSeconds = getRemainingSeconds(current.endAt, Date.now());
      if (remainingSeconds <= 0) {
        completeTimer(current.endAt);
      } else if (remainingSeconds !== current.remainingSeconds) {
        commitState({ ...current, remainingSeconds });
      }
    };
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [commitState, completeTimer, state.endAt, state.isRunning]);

  const startTimer = () => commitState(startPomodoro(stateRef.current, Date.now()));
  const pauseTimer = () => {
    if (pendingCompletionEndAtRef.current !== null) return;
    commitState(pausePomodoro(stateRef.current, Date.now()));
  };
  const stopTimer = () => {
    const current = stateRef.current;
    if (pendingCompletionEndAtRef.current !== null && pendingCompletionEndAtRef.current === current.endAt) return;
    const now = Date.now();
    const duration = getElapsedFocusSeconds(current, now);
    if (duration > 0) {
      void createFocusSessionAsync(focusSessionPayloadForCompletion(current, 'work', duration)).catch((error: unknown) => {
        console.error('Failed to persist stopped focus session:', error);
        showToast('Focus session could not be saved. Check your connection and try again.', 'error');
      });
    }
    completionGateRef.current = createCompletionGate();
    commitState(stopPomodoro(current));
  };
  const resetTimer = () => {
    if (pendingCompletionEndAtRef.current !== null) return;
    completionGateRef.current = createCompletionGate();
    commitState(resetPomodoro(stateRef.current));
  };
  const skipToNext = () => {
    if (pendingCompletionEndAtRef.current !== null) return;
    completionGateRef.current = createCompletionGate();
    commitState(skipPomodoro(stateRef.current));
  };
  const selectTask = (taskId: string) => commitState({ ...stateRef.current, selectedTaskId: taskId });
  const updateSettings = (patch: Partial<PomodoroSettings>) => commitState(updatePomodoroSettings(stateRef.current, patch));
  const setSoundEnabled = (enabled: boolean) => updateSettings({ soundEnabled: enabled });

  return (
    <PomodoroContext.Provider value={{ state, startTimer, pauseTimer, stopTimer, resetTimer, skipToNext, selectTask, updateSettings, setSoundEnabled }}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) throw new Error('usePomodoro must be used within PomodoroProvider');
  return context;
}
