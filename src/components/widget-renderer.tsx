// src/components/widget-renderer.tsx
import { Widget } from '@/types/dashboard';
import TaskWidget from './widgets/task-widget';
import WeatherWidget from './widgets/weather-widget';
import NewsWidget from './widgets/news-widget';
import PomodoroWidget from './widgets/pomodoro-widget';
import CalendarWidget from './widgets/calendar-widget';
import StocksWidget from './widgets/stocks-widget';
import NotesWidget from './widgets/notes-widget';
import AnalyticsWidget from './widgets/analytics-widget';
import BookmarksWidget from './widgets/bookmarks-widget';
import GoalsWidget from './widgets/goals-widget';
import { AnimatedWidget } from './animated-widget';

interface WidgetRendererProps {
  widget: Widget;
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  if (!widget) {
    return (
      <AnimatedWidget className="h-full">
        <div className="p-4 text-center text-gray-500">Widget not found</div>
      </AnimatedWidget>
    );
  }

  const renderWidget = () => {
    switch (widget.type) {
      case 'todo':
        return <TaskWidget widgetId={widget.id} title={widget.title} />;
      case 'weather':
        return <WeatherWidget widgetId={widget.id} title={widget.title} />;
      case 'news':
        return <NewsWidget widgetId={widget.id} title={widget.title} />;
      case 'pomodoro':
        return <PomodoroWidget widgetId={widget.id} title={widget.title} />;
      case 'calendar':
        return <CalendarWidget widgetId={widget.id} title={widget.title} />;
      case 'stocks':
        return <StocksWidget widgetId={widget.id} title={widget.title} />;
      case 'notes':
        return <NotesWidget widgetId={widget.id} title={widget.title} />;
      case 'analytics':
        return <AnalyticsWidget widgetId={widget.id} title={widget.title} />;
      case 'bookmarks':
        return <BookmarksWidget widgetId={widget.id} title={widget.title} />;
      case 'goals':
        return <GoalsWidget widgetId={widget.id} title={widget.title} />;
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            Unknown widget: {widget.type}
          </div>
        );
    }
  };

  return (
    <AnimatedWidget className="h-full">
      {renderWidget()}
    </AnimatedWidget>
  );
}