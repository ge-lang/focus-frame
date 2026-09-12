// src/components/edit-toggle.tsx
'use client';
import { useDashboard } from '@/contexts/dashboard-context';

export function EditToggle() {
  const { state, toggleEdit } = useDashboard();
  const { isEditing } = state;

  return (
    <button
      type="button"
      onClick={toggleEdit}
      aria-label={isEditing ? 'Finish editing layout' : 'Edit dashboard layout'}
      className="ff-header-action ff-glass-control text-indigo-700 hover:bg-indigo-50/80"
    >
      {isEditing ? (
        <span>Done</span>
      ) : (
        <span>Edit</span>
      )}
    </button>
  );
}
