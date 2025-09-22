// src/components/widgets/notes-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';
import { useState } from 'react';

interface NotesWidgetProps {
  widgetId: string;
  title?: string;
}

export default function NotesWidget({ widgetId, title }: NotesWidgetProps) {
  const [notes, setNotes] = useState('');

  return (
    <AnimatedWidget className="bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="h-full flex flex-col">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">
          {title || 'Notes'}
        </h3>
        
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write your notes here..."
          className="flex-1 w-full p-3 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white/50"
          rows={5}
        />
        
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-500">
            {notes.length} characters
          </span>
          <button
            onClick={() => setNotes('')}
            className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </AnimatedWidget>
  );
}