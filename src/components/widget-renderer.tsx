// src/components/widget-renderer.tsx
import { WidgetType } from '@/types/dashboard';
import TaskWidget from './widgets/task-widget';
import WeatherWidget from './widgets/weather-widget';
import NewsWidget from './widgets/news-widget';
import PomodoroWidget from './widgets/pomodoro-widget';
import CalendarWidget from './widgets/calendar-widget';
import { AnimatedWidget } from './animated-widget';

export function WidgetRenderer({ type, id }: { type: WidgetType; id: string }) {
  const renderWidget = () => {
    switch (type) {
      case 'todo':
        return <TaskWidget />;
      case 'weather':
        return <WeatherWidget />;
      case 'news':
        return <NewsWidget />;
      case 'pomodoro':
        return <PomodoroWidget />;
      case 'calendar':
        return <CalendarWidget />;
      default:
        return <div>Unknown widget: {type}</div>;
    }
  };

  return (
    <AnimatedWidget>
      {renderWidget()}
    </AnimatedWidget>
  );
}