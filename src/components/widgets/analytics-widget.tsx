// src/components/widgets/analytics-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Target, 
  Calendar,
  BarChart3,
  Settings,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalyticsWidgetProps {
  widgetId: string;
  title?: string;
}

interface AnalyticsData {
  productivity: number;
  focusTime: number; // в минутах
  completedTasks: number;
  weeklyTrend: number;
  dailyGoal: number;
  streak: number;
  distractionTime: number;
  peakHours: string[];
  taskDistribution: {
    work: number;
    personal: number;
    health: number;
    learning: number;
  };
}

interface TimeRange {
  label: string;
  value: 'today' | 'week' | 'month' | 'year';
}

const timeRanges: TimeRange[] = [
  { label: 'Today', value: 'today' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' }
];

// Генерация реалистичных демо-данных
const generateDemoData = (range: TimeRange['value']): AnalyticsData => {
  const baseProductivity = 65 + Math.random() * 30;
  const baseFocusTime = range === 'today' ? 384 : range === 'week' ? 2688 : range === 'month' ? 11520 : 138240;
  const baseCompletedTasks = range === 'today' ? 8 : range === 'week' ? 45 : range === 'month' ? 180 : 2160;
  
  return {
    productivity: Math.round(baseProductivity),
    focusTime: Math.round(baseFocusTime * (0.8 + Math.random() * 0.4)),
    completedTasks: Math.round(baseCompletedTasks * (0.9 + Math.random() * 0.2)),
    weeklyTrend: Math.round((Math.random() - 0.3) * 30),
    dailyGoal: 85,
    streak: Math.floor(Math.random() * 21) + 5,
    distractionTime: Math.round(baseFocusTime * 0.15 * (0.5 + Math.random())),
    peakHours: ['09:00-11:00', '14:00-16:00', '19:00-21:00'],
    taskDistribution: {
      work: 45 + Math.random() * 20,
      personal: 15 + Math.random() * 10,
      health: 10 + Math.random() * 10,
      learning: 20 + Math.random() * 15
    }
  };
};

// Форматирование времени
const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Цвета для индикаторов
const getTrendColor = (trend: number): string => {
  if (trend > 0) return 'text-green-600';
  if (trend < 0) return 'text-red-600';
  return 'text-gray-600';
};

const getTrendIcon = (trend: number): string => {
  if (trend > 0) return '↗️';
  if (trend < 0) return '↘️';
  return '→';
};

export default function AnalyticsWidget({ widgetId, title }: AnalyticsWidgetProps) {
  const [timeRange, setTimeRange] = useState<TimeRange['value']>('week');
  const [data, setData] = useState<AnalyticsData>(generateDemoData('week'));
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  useEffect(() => {
    setIsLoading(true);
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setData(generateDemoData(timeRange));
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [timeRange]);

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateDemoData(timeRange));
      setIsLoading(false);
    }, 800);
  };

  const calculateProgress = (current: number, goal: number): number => {
    return Math.min((current / goal) * 100, 100);
  };

  const productivityProgress = calculateProgress(data.productivity, data.dailyGoal);
  const focusProgress = calculateProgress(data.focusTime, 8 * 60); // 8 часов цели
  const tasksProgress = calculateProgress(data.completedTasks, 10); // 10 задач цели

  return (
    <AnimatedWidget className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="h-full flex flex-col">
        {/* Заголовок и управление */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-800 flex items-center">
              <BarChart3 size={20} className="mr-2 text-purple-600" />
              {title || 'Productivity Analytics'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {timeRanges.find(r => r.value === timeRange)?.label} • {data.streak} day streak
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              title={showDetails ? 'Hide details' : 'Show details'}
            >
              {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Переключение периода */}
        <div className="flex gap-1 mb-6">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                timeRange === range.value
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Основные метрики */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Продуктивность */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 rounded-xl p-4 shadow-sm border border-white/50"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={20} className="text-purple-500" />
              <span className={`text-xs font-medium ${getTrendColor(data.weeklyTrend)}`}>
                {getTrendIcon(data.weeklyTrend)} {Math.abs(data.weeklyTrend)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{data.productivity}%</div>
            <div className="text-xs text-gray-600">Productivity</div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-purple-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${productivityProgress}%` }}
              />
            </div>
          </motion.div>

          {/* Фокус-тайм */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 rounded-xl p-4 shadow-sm border border-white/50"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock size={20} className="text-blue-500" />
              <span className="text-xs text-gray-500">⏱️</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{formatTime(data.focusTime)}</div>
            <div className="text-xs text-gray-600">Focus Time</div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${focusProgress}%` }}
              />
            </div>
          </motion.div>

          {/* Завершенные задачи */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 rounded-xl p-4 shadow-sm border border-white/50"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle size={20} className="text-green-500" />
              <span className="text-xs text-gray-500">✅</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{data.completedTasks}</div>
            <div className="text-xs text-gray-600">Completed</div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-green-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${tasksProgress}%` }}
              />
            </div>
          </motion.div>

          {/* Отвлечения */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 rounded-xl p-4 shadow-sm border border-white/50"
          >
            <div className="flex items-center justify-between mb-2">
              <Target size={20} className="text-orange-500" />
              <span className="text-xs text-gray-500">🎯</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{formatTime(data.distractionTime)}</div>
            <div className="text-xs text-gray-600">Distraction</div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-orange-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((data.distractionTime / 120) * 100, 100)}%` }}
              />
            </div>
          </motion.div>
        </div>

        {/* Детальная аналитика */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {/* Распределение задач */}
              <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-white/50">
                <h4 className="font-medium text-gray-800 mb-3">Task Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(data.taskDistribution).map(([category, percentage]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              category === 'work' ? 'bg-purple-500' :
                              category === 'personal' ? 'bg-blue-500' :
                              category === 'health' ? 'bg-green-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-8 text-right">{percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Пиковые часы */}
              <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-white/50">
                <h4 className="font-medium text-gray-800 mb-3">Peak Productivity Hours</h4>
                <div className="flex gap-2">
                  {data.peakHours.map((hour, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {hour}
                    </span>
                  ))}
                </div>
              </div>

              {/* Еженедельный прогресс */}
              <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-white/50">
                <h4 className="font-medium text-gray-800 mb-3">Weekly Progress</h4>
                <div className="flex gap-1">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-full h-16 relative">
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-full transition-all duration-500"
                          style={{ height: `${20 + Math.random() * 80}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 mt-1">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Футер */}
        <div className="mt-auto pt-4 border-t border-gray-200/50">
          <p className="text-xs text-gray-500 text-center">
            📊 Analytics updated just now • 
            <button 
              onClick={refreshData}
              className="ml-1 text-purple-500 hover:text-purple-700"
            >
              Refresh data
            </button>
          </p>
        </div>
      </div>
    </AnimatedWidget>
  );
}