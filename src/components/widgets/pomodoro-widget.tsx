// src/components/widgets/pomodoro-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Settings, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PomodoroWidgetProps {
  widgetId: string;
  title?: string;
}

type TimerMode = 'work' | 'break' | 'longBreak';

interface PomodoroSettings {
  workTime: number; // в минутах
  breakTime: number;
  longBreakTime: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
}

const defaultSettings: PomodoroSettings = {
  workTime: 25,
  breakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  soundEnabled: true,
};

export default function PomodoroWidget({ widgetId, title }: PomodoroWidgetProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // в секундах
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Инициализация аудио контекста при первом взаимодействии
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioContextRef.current = new AudioContext();
        }
      }
    };

    // Инициализируем аудио при первом клике на виджет
    const handleClick = () => {
      initAudio();
      document.removeEventListener('click', handleClick);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Инициализация времени из настроек
  useEffect(() => {
    setTimeLeft(settings.workTime * 60);
  }, [settings.workTime]);

  // Таймер
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Таймер завершился
      handleTimerComplete();
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Функция для воспроизведения встроенного звука
  const playNotificationSound = () => {
    if (!settings.soundEnabled || !audioContextRef.current) return;

    try {
      const audioContext = audioContextRef.current;
      
      // Создаем осциллятор для генерации звука
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Подключаем узлы
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Настраиваем звук - два коротких бипа
      oscillator.frequency.value = 800; // Высота тона (Гц)
      oscillator.type = 'sine'; // Тип волны (синусоида)
      
      // Настраиваем громкость с плавным затуханием
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1); // Быстро нарастает
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3); // Плавно затухает
      
      // Воспроизводим звук
      oscillator.start(now);
      oscillator.stop(now + 0.3); // Короткий звук 300ms
      
    } catch (error) {
      console.log('Sound playback error:', error);
    }
  };

  const handleTimerComplete = () => {
    // Воспроизводим звук уведомления
    playNotificationSound();
    
    if (mode === 'work') {
      const newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);
      
      // Определяем следующий режим
      const nextMode = newPomodoroCount % settings.longBreakInterval === 0 ? 'longBreak' : 'break';
      setMode(nextMode);
      setTimeLeft((nextMode === 'longBreak' ? settings.longBreakTime : settings.breakTime) * 60);
      
      if (settings.autoStartBreaks) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    } else {
      // Завершился перерыв - возвращаемся к работе
      setMode('work');
      setTimeLeft(settings.workTime * 60);
      
      if (settings.autoStartPomodoros) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    }
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const stopTimer = () => {
    setIsRunning(false);
    setTimeLeft(settings.workTime * 60);
    setMode('work');
  };
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? settings.workTime * 60 : 
                mode === 'break' ? settings.breakTime * 60 : 
                settings.longBreakTime * 60);
  };

  const skipToNext = () => {
    setIsRunning(false);
    if (mode === 'work') {
      handleTimerComplete();
    } else {
      setMode('work');
      setTimeLeft(settings.workTime * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (mode === 'work' ? settings.workTime * 60 : 
                               mode === 'break' ? settings.breakTime * 60 : 
                               settings.longBreakTime * 60)) * 100;

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

  return (
    <AnimatedWidget className="bg-gradient-to-br from-orange-50 to-red-100">
      <div className="h-full flex flex-col">
        {/* Заголовок и настройки */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg text-gray-800">
            {title || 'Pomodoro Timer'}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={`p-1 rounded-full ${
                settings.soundEnabled ? 'text-green-600' : 'text-gray-400'
              }`}
              title={settings.soundEnabled ? 'Sound on' : 'Sound off'}
            >
              {settings.soundEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Настройки */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-white/50 rounded-lg overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Work (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.workTime}
                    onChange={(e) => setSettings({ ...settings, workTime: parseInt(e.target.value) || 1 })}
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
                    onChange={(e) => setSettings({ ...settings, breakTime: parseInt(e.target.value) || 1 })}
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
                    onChange={(e) => setSettings({ ...settings, longBreakTime: parseInt(e.target.value) || 1 })}
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
                    onChange={(e) => setSettings({ ...settings, longBreakInterval: parseInt(e.target.value) || 1 })}
                    className="w-full p-1 border border-gray-300 rounded text-center"
                  />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => setSettings({ ...settings, autoStartBreaks: e.target.checked })}
                    className="mr-2"
                  />
                  Auto-start breaks
                </label>
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={settings.autoStartPomodoros}
                    onChange={(e) => setSettings({ ...settings, autoStartPomodoros: e.target.checked })}
                    className="mr-2"
                  />
                  Auto-start work sessions
                </label>
              </div>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => setSettings(defaultSettings)}
                  className="flex-1 px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Таймер */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Прогресс круг */}
          <div className="relative mb-6">
            <div className="w-48 h-48 rounded-full bg-white/50 shadow-inner">
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
                  stroke={getModeColor() === 'red' ? '#ef4444' : getModeColor() === 'green' ? '#10b981' : '#3b82f6'}
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
                getModeColor() === 'red' ? 'text-red-600' : 
                getModeColor() === 'green' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {getModeLabel()}
              </div>
            </div>
          </div>

          {/* Счетчик помидоров */}
          <div className="flex space-x-1 mb-6">
            {Array.from({ length: Math.max(4, settings.longBreakInterval) }).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index < pomodoroCount % settings.longBreakInterval 
                    ? 'bg-red-500' 
                    : 'bg-gray-300'
                }`}
                title={`Pomodoro ${index + 1}`}
              />
            ))}
          </div>

          {/* Управление */}
          <div className="flex space-x-3">
            {!isRunning ? (
              <button
                onClick={startTimer}
                className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-lg"
                title="Start"
              >
                <Play size={20} />
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="p-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors shadow-lg"
                title="Pause"
              >
                <Pause size={20} />
              </button>
            )}
            
            <button
              onClick={stopTimer}
              className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              title="Stop"
            >
              <Square size={20} />
            </button>
            
            <button
              onClick={resetTimer}
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
              title="Reset"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Пропустить */}
          <button
            onClick={skipToNext}
            className="mt-4 text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Skip to {mode === 'work' ? 'break' : 'work'}
          </button>
        </div>

        {/* Статистика */}
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