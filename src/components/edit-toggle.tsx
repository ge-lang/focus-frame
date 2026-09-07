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
      className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700"
    >
      {isEditing ? (
        <>
          <Eye size={18} />
          <span>View Mode</span>
        </>
      ) : (
        <>
          <Edit size={18} />
          <span>Edit Mode</span>
        </>
      )}
    </AnimatedButton>
  );
}
