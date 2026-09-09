import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, action }: EmptyStateProps) {
  return (
    <div className="ff-empty-state flex flex-col items-center justify-center gap-1.5 px-3 py-3 text-center text-slate-500">
      {Icon && <Icon size={16} strokeWidth={1.75} className="text-slate-400" aria-hidden="true" />}
      <p className="text-xs">{title}</p>
      {action}
    </div>
  );
}
