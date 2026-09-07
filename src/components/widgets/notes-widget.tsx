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
    <AnimatedWidget>
      <div className="h-full flex flex-col">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">{title || 'Notes'}</h3>
        <textarea
          aria-label="Notes"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write your notes here..."
          className="w-full flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={5}
          disabled={isLoading}
        />
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-500">{isSaving ? 'Saving…' : `${content.length} characters`}</span>
          <button aria-label="Clear notes" onClick={() => setContent('')} className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 transition-colors hover:bg-slate-50">
            Clear
          </button>
        </div>
      </div>
    </AnimatedWidget>
  );
}
