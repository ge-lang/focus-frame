// src/components/widgets/bookmarks-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';
import { useState } from 'react';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
}

interface BookmarksWidgetProps {
  widgetId: string;
  title?: string;
}

const initialBookmarks: Bookmark[] = [
  { id: '1', title: 'GitHub', url: 'https://github.com', category: 'Development' },
  { id: '2', title: 'Twitter', url: 'https://twitter.com', category: 'Social' },
  { id: '3', title: 'Google Docs', url: 'https://docs.google.com', category: 'Productivity' },
  { id: '4', title: 'Notion', url: 'https://notion.so', category: 'Organization' },
];

export default function BookmarksWidget({ widgetId, title }: BookmarksWidgetProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [isAdding, setIsAdding] = useState(false);
  const [newBookmark, setNewBookmark] = useState({ title: '', url: '', category: '' });

  const addBookmark = () => {
    if (newBookmark.title && newBookmark.url) {
      setBookmarks([
        ...bookmarks,
        {
          id: Date.now().toString(),
          title: newBookmark.title,
          url: newBookmark.url.startsWith('http') ? newBookmark.url : `https://${newBookmark.url}`,
          category: newBookmark.category || 'General',
        }
      ]);
      setNewBookmark({ title: '', url: '', category: '' });
      setIsAdding(false);
    }
  };

  const removeBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
  };

  return (
    <AnimatedWidget className="bg-gradient-to-br from-green-50 to-teal-100">
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg text-gray-800">
            {title || 'Bookmarks'}
          </h3>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-1 text-green-600 hover:text-green-800 transition-colors"
            title="Add bookmark"
          >
            ➕
          </button>
        </div>

        {isAdding && (
          <div className="mb-4 p-3 bg-white/50 rounded-lg">
            <input
              type="text"
              placeholder="Title"
              value={newBookmark.title}
              onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
              className="w-full mb-2 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="url"
              placeholder="URL"
              value={newBookmark.url}
              onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
              className="w-full mb-2 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Category (optional)"
              value={newBookmark.category}
              onChange={(e) => setNewBookmark({ ...newBookmark, category: e.target.value })}
              className="w-full mb-2 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex space-x-2">
              <button
                onClick={addBookmark}
                className="flex-1 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="group relative p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="font-medium text-gray-800 group-hover:text-green-700 transition-colors">
                  {bookmark.title}
                </div>
                <div className="text-xs text-gray-600 truncate">{bookmark.url}</div>
                {bookmark.category && (
                  <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {bookmark.category}
                  </span>
                )}
              </a>
              <button
                onClick={() => removeBookmark(bookmark.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700"
                title="Remove bookmark"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {bookmarks.length === 0 && !isAdding && (
          <div className="text-center text-gray-500 py-4">
            No bookmarks yet. Click + to add one.
          </div>
        )}
      </div>
    </AnimatedWidget>
  );
}