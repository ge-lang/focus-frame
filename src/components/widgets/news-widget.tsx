// src/components/widgets/news-widget.tsx
'use client';

export default function NewsWidget() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="font-semibold mb-4">News</h3>
      <div className="space-y-2">
        <div className="border-b pb-2">
          <div className="font-medium">Tech news</div>
          <div className="text-sm text-gray-600">Latest updates in technology</div>
        </div>
        <div className="border-b pb-2">
          <div className="font-medium">Productivity tips</div>
          <div className="text-sm text-gray-600">How to improve your workflow</div>
        </div>
      </div>
    </div>
  );
}