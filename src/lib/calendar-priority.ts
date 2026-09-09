export type CalendarPriority = 'low' | 'medium' | 'high';

export function getCalendarPriorityAccent(priority: string | null | undefined): string | null {
  switch (priority) {
    case 'low':
      return 'ff-accent-green';
    case 'medium':
      return 'ff-accent-amber';
    case 'high':
      return 'ff-accent-rose';
    default:
      return null;
  }
}
