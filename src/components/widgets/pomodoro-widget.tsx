// src/components/widgets/pomodoro-widget.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { AnimatedWidget } from '@/components/animated-widget';
import { AnimatedButton } from '@/components/animated-button';
import { Play, Pause, RotateCcw, AlarmClock } from 'lucide-react';
import { motion } from 'framer-motion';

const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

export default function PomodoroWidget() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [cycles, setCycles] = useState(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(isWorkTime ? WORK_TIME : BREAK_TIME);
  }, [isWorkTime]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer completed
      setIsActive(false);
      const newIsWorkTime = !isWorkTime;
      setIsWorkTime(newIsWorkTime);
      setTimeLeft(newIsWorkTime ? WORK_TIME : BREAK_TIME);
      
      if (!newIsWorkTime) {
        setCycles((c) => c + 1);
      }

      // Play sound notification (optional)
      new Audio('/notification.mp3').play().catch(() => {});
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isWorkTime]);

  const progress = (timeLeft / (isWorkTime ? WORK_TIME : BREAK_TIME)) * 100;

  return (
    <AnimatedWidget>
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <AlarmClock size={24} className="mr-2" />
          <h3 className="font-semibold text-lg">Pomodoro Timer</h3>
        </div>

        {/* Progress circle */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200 stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            />
            <motion.circle
              className="text-blue-500 stroke-current"
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 * (1 - progress / 100)}
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 251.2 * (1 - progress / 100) }}
              transition={{ duration: 1 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Timer mode */}
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isWorkTime 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {isWorkTime ? 'Work' : 'Break'}
          </span>
          <span className="ml-2 text-sm text-gray-500">
            Cycles: {cycles}
          </span>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-3">
          <AnimatedButton
            onClick={toggleTimer}
            className={`px-4 py-2 rounded-lg ${
              isActive 
                ? 'bg-yellow-500 hover:bg-yellow-600' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {isActive ? <Pause size={20} /> : <Play size={20} />}
          </AnimatedButton>

          <AnimatedButton
            onClick={resetTimer}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
          >
            <RotateCcw size={20} />
          </AnimatedButton>
        </div>

        {/* Session info */}
        <div className="mt-4 text-sm text-gray-600">
          <p>Next: {isWorkTime ? 'Break' : 'Work'} time</p>
          <p>Focus on your task!</p>
        </div>
      </div>
    </AnimatedWidget>
  );
}