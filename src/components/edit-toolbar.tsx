// src/components/edit-toolbar.tsx
'use client';
import { useDashboard } from '@/contexts/dashboard-context';
import { WidgetPicker } from './widget-picker';
import { AnimatedButton } from './animated-button';
import { X, Settings } from 'lucide-react';

export default function EditToolbar() {
  const { toggleEdit } = useDashboard();

  return (
    <div className="fixed top-4 right-4 z-50 flex space-x-2 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border">
      <WidgetPicker />
      
      <AnimatedButton
        onClick={toggleEdit}
        className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
      >
        <X size={18} />
        <span>Done Editing</span>
      </AnimatedButton>
    </div>
  );
}