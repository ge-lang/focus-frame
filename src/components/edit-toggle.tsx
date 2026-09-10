// src/components/edit-toggle.tsx
'use client';
import { useDashboard } from '@/contexts/dashboard-context';
import { Edit, Eye } from 'lucide-react';

export function EditToggle() {
  const { state, toggleEdit } = useDashboard();
  const { isEditing } = state;

  return (
    <button
      type="button"
      onClick={toggleEdit}
      className="ff-header-action ff-glass-control text-indigo-700 hover:bg-indigo-50/80"
    >
      <span className="ff-edit-icon" aria-hidden="true">
        {isEditing ? <Eye size={16} /> : <Edit size={16} />}
      </span>
      {isEditing ? (
        <span>Done</span>
      ) : (
        <span>Edit</span>
      )}
    </button>
  );
}
