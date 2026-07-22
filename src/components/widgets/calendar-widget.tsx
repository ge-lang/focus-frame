// src/components/widgets/calendar-widget.tsx
'use client';
import { useState } from 'react';
import { AnimatedWidget } from '@/components/animated-widget';
import { AnimatedButton } from '@/components/animated-button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useTasks } from '@/hooks/use-tasks';



// src/components/widgets/calendar-widget.tsx
interface CalendarWidgetProps {
  widgetId: string;
  title?: string;
}

export default function CalendarWidget({ widgetId, title }: CalendarWidgetProps)  {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: tasks = [] } = useTasks();

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();
  const taskDueOn = (day: number) => tasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(`${task.dueDate.slice(0, 10)}T00:00:00`);
    return dueDate.getFullYear() === year && dueDate.getMonth() === month && dueDate.getDate() === day;
  });
  const upcomingTasks = tasks
    .filter((task) => {
      if (!task.dueDate || task.isCompleted) return false;
      const dueDate = new Date(`${task.dueDate.slice(0, 10)}T00:00:00`);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      end.setDate(end.getDate() + 7);
      return dueDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate()) && dueDate <= end;
    })
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 4);

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <AnimatedWidget>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CalendarIcon size={20} className="mr-2" />
            <h3 className="font-semibold text-lg">{title || 'Calendar'}</h3>
          </div>
          
          {!isCurrentMonth && (
            <AnimatedButton
              onClick={goToToday}
              className="text-xs px-2 py-1 bg-blue-500 text-white rounded"
            >
              Today
            </AnimatedButton>
          )}
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <AnimatedButton
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft size={16} />
          </AnimatedButton>

          <span className="font-semibold">
            {monthNames[month]} {year}
          </span>

          <AnimatedButton
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight size={16} />
          </AnimatedButton>
        </div>

        {/* Week days */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dueTasks = day === null ? [] : taskDueOn(day);
            return (
            <div
              key={index}
              title={dueTasks.map((task) => task.title).join(', ')}
              className={`h-8 flex flex-col items-center justify-center text-sm rounded ${
                day === null
                  ? 'text-gray-300'
                  : isToday(day)
                  ? 'bg-blue-500 text-white font-bold'
                  : 'hover:bg-gray-100 cursor-pointer'
              }`}
            >
              {day}
              {dueTasks.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-0.5" />}
            </div>
          )})}
        </div>

        {/* Upcoming task deadlines */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium text-sm mb-2">Next 7 days</h4>
          {upcomingTasks.length ? <div className="space-y-1">
            {upcomingTasks.map((task) => <div key={task.id} className="text-xs flex justify-between gap-2 text-gray-600"><span className="truncate">{task.title}</span><span className="shrink-0 text-blue-600">{new Date(`${task.dueDate?.slice(0, 10)}T00:00:00`).toLocaleDateString()}</span></div>)}
          </div> : <div className="text-xs text-gray-500 text-center">No task deadlines this week</div>}
        </div>
      </div>
    </AnimatedWidget>
  );
}
