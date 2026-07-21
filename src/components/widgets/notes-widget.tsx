'use client';
import { useEffect, useState } from 'react';
import { AnimatedWidget } from '@/components/animated-widget';
import { useNote, useSaveNote } from '@/hooks/use-personal-widgets';

interface NotesWidgetProps {
  widgetId: string;
  title?: string;
}

export default function NotesWidget({ widgetId, title }: NotesWidgetProps) {
  const { data: note, isLoading } = useNote(widgetId);
  const { mutate: saveNote, isPending: isSaving } = useSaveNote();
  const [content, setContent] = useState('');

  useEffect(() => {
    setContent(note?.content ?? '');
  }, [note?.content]);

  useEffect(() => {
    if (isLoading || content === (note?.content ?? '')) return;
    const timeoutId = window.setTimeout(() => saveNote({ widgetId, content }), 600);
    return () => window.clearTimeout(timeoutId);
  }, [content, isLoading, note?.content, saveNote, widgetId]);

  return (
    <AnimatedWidget className="bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="h-full flex flex-col">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">{title || 'Notes'}</h3>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write your notes here..."
          className="flex-1 w-full p-3 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white/50"
          rows={5}
          disabled={isLoading}
        />
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-500">{isSaving ? 'Saving…' : `${content.length} characters`}</span>
          <button onClick={() => setContent('')} className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors">
            Clear
          </button>
        </div>
      </div>
    </AnimatedWidget>
  );
}
