// src/components/widgets/pomodoro-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';
import { ModalPortal } from '@/components/modal-portal';
import { useState } from 'react';
import { Play, Pause, Square, RotateCcw, Settings, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '@/hooks/use-tasks';
import { useUpdateUserSettings, useUserSettings } from '@/hooks/use-settings';
import { usePomodoro } from '@/contexts/pomodoro-context';
import { defaultPomodoroSettings } from '@/lib/pomodoro-timer';

interface PomodoroWidgetProps {
  widgetId: string;
  title?: string;
}

export default function PomodoroWidget({ widgetId, title }: PomodoroWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const {
    state: pomodoro,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    skipToNext,
    selectTask,
    updateSettings,
    setSoundEnabled,
  } = usePomodoro();
  const { mode, isRunning, remainingSeconds: timeLeft, pomodoroCount, selectedTaskId, settings } = pomodoro;
  const { data: tasks = [] } = useTasks();
  const { data: userSettings } = useUserSettings();
  const { mutate: updateUserSettings } = useUpdateUserSettings();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / pomodoro.durationSeconds) * 100;

  const getModeColor = () => {
    switch (mode) {
      case 'work': return 'red';
      case 'break': return 'green';
      case 'longBreak': return 'blue';
      default: return 'gray';
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'work': return 'Focus Time';
      case 'break': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return '';
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (!enabled) {
      updateUserSettings({ notificationsEnabled: false });
      return;
    }

    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    updateUserSettings({ notificationsEnabled: permission === 'granted' });
  };

  return (
    <AnimatedWidget>
      <div className="h-full flex flex-col">
        {/* Header and settings */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="widget-drag-handle cursor-grab select-none font-semibold text-lg text-gray-800 active:cursor-grabbing">
            {title || 'Pomodoro Timer'}
          </h3>
          <div className="flex space-x-2">
            <button
              aria-label={settings.soundEnabled ? 'Turn sound off' : 'Turn sound on'}
              onClick={() => setSoundEnabled(!settings.soundEnabled)}
              className={`p-1 rounded-full ${
                settings.soundEnabled ? 'text-green-600' : 'text-gray-400'
              }`}
              title={settings.soundEnabled ? 'Sound on' : 'Sound off'}
            >
              {settings.soundEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
            <button
              aria-label={showSettings ? 'Close Pomodoro settings' : 'Open Pomodoro settings'}
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Settings */}
        <AnimatePresence>
          {showSettings && (
            <ModalPortal>
              <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ff-modal-backdrop fixed inset-0 flex items-start justify-center overflow-y-auto overscroll-contain p-4 pt-[max(4rem,10vh)]"
              onClick={() => setShowSettings(false)}
            >
              <div onClick={(event) => event.stopPropagation()} className="ff-modal-panel w-full max-w-md max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Work (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.workTime}
                    onChange={(e) => updateSettings({ workTime: parseInt(e.target.value) || 1 })}
                    className="w-full p-1 border border-gray-300 rounded text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Break (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.breakTime}
                    onChange={(e) => updateSettings({ breakTime: parseInt(e.target.value) || 1 })}
                    className="w-full p-1 border border-gray-300 rounded text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Long Break (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.longBreakTime}
                    onChange={(e) => updateSettings({ longBreakTime: parseInt(e.target.value) || 1 })}
                    className="w-full p-1 border border-gray-300 rounded text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Interval</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.longBreakInterval}
                    onChange={(e) => updateSettings({ longBreakInterval: parseInt(e.target.value) || 1 })}
                    className="w-full p-1 border border-gray-300 rounded text-center"
                  />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
                    className="mr-2"
                  />
                  Auto-start breaks
                </label>
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={settings.autoStartPomodoros}
                    onChange={(e) => updateSettings({ autoStartPomodoros: e.target.checked })}
                    className="mr-2"
                  />
                  Auto-start work sessions
                </label>
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={userSettings?.notificationsEnabled ?? false}
                    onChange={(e) => void toggleNotifications(e.target.checked)}
                    className="mr-2"
                  />
                  Browser notifications when a session ends
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Daily focus goal (min)</label>
                  <input
                    type="number"
                    min="15"
                    max="960"
                    value={userSettings?.dailyFocusGoal ?? 100}
                    onChange={(e) => updateUserSettings({ dailyFocusGoal: Math.max(15, Math.min(960, parseInt(e.target.value) || 15)) })}
                    className="w-full p-1 border border-gray-300 rounded text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Daily Pomodoro goal</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={userSettings?.dailyPomodoroGoal ?? 4}
                    onChange={(e) => updateUserSettings({ dailyPomodoroGoal: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) })}
                    className="w-full p-1 border border-gray-300 rounded text-center"
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => updateSettings(defaultPomodoroSettings)}
                  className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 rounded-md bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700"
                >
                  Apply
                </button>
              </div>
              </div>
              </motion.div>
            </ModalPortal>
          )}
        </AnimatePresence>

        {/* Timer */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Progress circle */}
          <div className="relative mb-6">
              <div className="ff-pomodoro-ring-shell h-48 w-48 rounded-full bg-slate-50 shadow-inner ring-8 ring-indigo-100">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={getModeColor() === 'red' ? '#6366f1' : getModeColor() === 'green' ? '#818cf8' : '#4f46e5'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * progress) / 100}
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-mono font-bold text-gray-800">
                {formatTime(timeLeft)}
              </div>
              <div className={`text-sm font-medium ${
                getModeColor() === 'red' ? 'text-indigo-600' :
                getModeColor() === 'green' ? 'text-indigo-500' : 'text-indigo-700'
              }`}>
                {getModeLabel()}
              </div>
            </div>
          </div>

          {/* Pomodoro counter */}
          <div className="flex space-x-1 mb-6">
            {Array.from({ length: Math.max(4, settings.longBreakInterval) }).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index < pomodoroCount % settings.longBreakInterval 
                    ? 'bg-indigo-500'
                    : 'bg-gray-300'
                }`}
                title={`Pomodoro ${index + 1}`}
              />
            ))}
          </div>

          {mode === 'work' && (
            <select
              value={selectedTaskId}
              onChange={(event) => selectTask(event.target.value)}
              className="mb-4 w-full max-w-xs rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm"
              aria-label="Task for this focus session"
            >
              <option value="">No task selected</option>
              {tasks.filter((task) => !task.isCompleted).map((task) => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
          )}

          {/* Controls */}
          <div className="flex space-x-3">
            {!isRunning ? (
              <button
                aria-label="Start focus timer"
                onClick={startTimer}
                className="rounded-full bg-indigo-600 p-3 text-white shadow-sm transition-colors hover:bg-indigo-700"
                title="Start"
              >
                <Play size={20} />
              </button>
            ) : (
              <button
                aria-label="Pause focus timer"
                onClick={pauseTimer}
                className="rounded-full border border-slate-200 bg-white p-3 text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                title="Pause"
              >
                <Pause size={20} />
              </button>
            )}
            
            <button
              aria-label="Stop focus timer"
              onClick={stopTimer}
                className="rounded-full border border-red-200 bg-white p-3 text-red-600 shadow-sm transition-colors hover:bg-red-50"
              title="Stop"
            >
              <Square size={20} />
            </button>
            
            <button
              aria-label="Reset focus timer"
              onClick={resetTimer}
                className="rounded-full border border-slate-200 bg-white p-3 text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              title="Reset"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Skip */}
          <button
            onClick={skipToNext}
            className="mt-4 text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Skip to {mode === 'work' ? 'break' : 'work'}
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Completed: {pomodoroCount}</span>
            <span>Session: {Math.floor(pomodoroCount / settings.longBreakInterval) + 1}</span>
          </div>
        </div>
      </div>
    </AnimatedWidget>
  );
}
