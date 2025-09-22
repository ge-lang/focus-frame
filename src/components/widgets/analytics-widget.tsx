// src/components/widgets/analytics-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';

interface AnalyticsWidgetProps {
  widgetId: string;
  title?: string;
}

const mockData = {
  productivity: 85,
  focusTime: '6h 24m',
  completedTasks: 12,
  weeklyTrend: '+15%',
};

export default function AnalyticsWidget({ widgetId, title }: AnalyticsWidgetProps) {
  return (
    <AnimatedWidget className="bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="h-full">
        <h3 className="font-semibold text-lg mb-6 text-gray-800">
          {title || 'Analytics'}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-white/50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{mockData.productivity}%</div>
            <div className="text-sm text-gray-600">Productivity</div>
          </div>
          
          <div className="text-center p-4 bg-white/50 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">{mockData.focusTime}</div>
            <div className="text-sm text-gray-600">Focus Time</div>
          </div>
          
          <div className="text-center p-4 bg-white/50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{mockData.completedTasks}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          
          <div className="text-center p-4 bg-white/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{mockData.weeklyTrend}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white/50 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Weekly Progress</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
    </AnimatedWidget>
  );
}