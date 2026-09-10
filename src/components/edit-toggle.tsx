// src/components/edit-toggle.tsx
'use client';
import { useDashboard } from '@/contexts/dashboard-context';
import { AnimatedButton } from './animated-button';
import { Edit, Eye } from 'lucide-react';

export function EditToggle() {
  const { state, toggleEdit } = useDashboard();
  const { isEditing } = state;

  return (
    <AnimatedButton
      onClick={toggleEdit}
      className="ff-header-action ff-glass-control text-indigo-700 hover:bg-indigo-50/80"
    >
      {isEditing ? (
        <>
          <Eye size={18} />
          <span>Done</span>
        </>
      ) : (
        <>
          <Edit size={18} />
          <span>Edit</span>
        </>
      )}
    </AnimatedButton>
  );
}
