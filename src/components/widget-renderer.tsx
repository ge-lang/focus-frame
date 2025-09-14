// src/components/widget-renderer.tsx
import TaskWidget from './widgets/task-widget';
import WeatherWidget from './widgets/weather-widget';
import NewsWidget from './widgets/news-widget';

export function WidgetRenderer({ type, id }: { type: string; id: string }) {
  switch (type) {
    case 'todo':
      return <TaskWidget />;
    case 'weather':
      return <WeatherWidget />;
    case 'news':
      return <NewsWidget />;
    default:
      return <div>Unknown widget: {type}</div>;
  }
}