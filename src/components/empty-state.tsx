import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-white/30 px-4 py-5 text-center text-gray-500">
      {Icon && <Icon size={18} className="text-gray-400" aria-hidden="true" />}
      <p className="text-sm">{title}</p>
      {action}
    </div>
  );
}
