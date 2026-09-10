'use client';
import { useState } from 'react';
import { AnimatedWidget } from '@/components/animated-widget';
import { EmptyState } from '@/components/empty-state';
import { Bookmark, Plus, X } from 'lucide-react';
import { useBookmarks, useCreateBookmark, useDeleteBookmark } from '@/hooks/use-personal-widgets';

interface BookmarksWidgetProps {
  widgetId: string;
  title?: string;
}

export default function BookmarksWidget({ title }: BookmarksWidgetProps) {
  const { data: bookmarks = [], isLoading } = useBookmarks();
  const { mutate: createBookmark } = useCreateBookmark();
  const { mutate: deleteBookmark } = useDeleteBookmark();
  const [isAdding, setIsAdding] = useState(false);
  const [newBookmark, setNewBookmark] = useState({ title: '', url: '', category: '' });

  const addBookmark = () => {
    if (!newBookmark.title.trim() || !newBookmark.url.trim()) return;
    createBookmark({ title: newBookmark.title.trim(), url: newBookmark.url.trim(), category: newBookmark.category.trim() || undefined });
    setNewBookmark({ title: '', url: '', category: '' });
    setIsAdding(false);
  };

  return (
    <AnimatedWidget>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="widget-drag-handle cursor-grab select-none font-semibold text-lg text-gray-800 active:cursor-grabbing">{title || 'Bookmarks'}</h3>
          <button aria-label={isAdding ? 'Close add bookmark form' : 'Add bookmark'} onClick={() => setIsAdding(!isAdding)} className="rounded-lg p-1.5 text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-800" title="Add bookmark">{isAdding ? <X size={16} /> : <Plus size={16} />}</button>
        </div>

        {isAdding && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <label className="sr-only" htmlFor="bookmark-title">Bookmark title</label>
            <input id="bookmark-title" type="text" placeholder="Title" value={newBookmark.title} onChange={(event) => setNewBookmark({ ...newBookmark, title: event.target.value })} className="w-full mb-2 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
            <label className="sr-only" htmlFor="bookmark-url">Bookmark URL</label>
            <input id="bookmark-url" type="url" placeholder="URL" value={newBookmark.url} onChange={(event) => setNewBookmark({ ...newBookmark, url: event.target.value })} className="w-full mb-2 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
            <label className="sr-only" htmlFor="bookmark-category">Bookmark category</label>
            <input id="bookmark-category" type="text" placeholder="Category (optional)" value={newBookmark.category} onChange={(event) => setNewBookmark({ ...newBookmark, category: event.target.value })} className="w-full mb-2 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
            <div className="flex space-x-2"><button onClick={addBookmark} className="flex-1 rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700">Add</button><button onClick={() => setIsAdding(false)} className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">Cancel</button></div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading && <p className="text-sm text-gray-500">Loading bookmarks…</p>}
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="group relative rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50">
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="block">
                <div className="font-medium text-slate-900 transition-colors group-hover:text-indigo-700">{bookmark.title}</div>
                <div className="text-xs text-gray-600 truncate">{bookmark.url}</div>
                {bookmark.category && <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{bookmark.category}</span>}
              </a>
              <button aria-label={`Remove bookmark: ${bookmark.title}`} onClick={() => deleteBookmark(bookmark.id)} className="absolute right-2 top-2 rounded p-1 text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-700" title="Remove bookmark"><X size={14} /></button>
            </div>
          ))}
        </div>
        {!isLoading && bookmarks.length === 0 && !isAdding && (
          <EmptyState
            icon={Bookmark}
            title="No bookmarks yet"
            action={<button onClick={() => setIsAdding(true)} className="text-sm font-medium text-indigo-700 hover:text-indigo-900">Add bookmark</button>}
          />
        )}
      </div>
    </AnimatedWidget>
  );
}
