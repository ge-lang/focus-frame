// src/components/widgets/news-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';
import { useState } from 'react';
import { ExternalLink, Calendar, Newspaper, RefreshCw, Key, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNews } from '@/hooks/use-news';

interface NewsWidgetProps {
  widgetId: string;
  title?: string;
}

const categories = [
  'general', 'technology', 'business', 'science', 'sports', 'entertainment', 'health'
];

const categoryEmojis: Record<string, string> = {
  'general': '🌐',
  'technology': '💻',
  'business': '💼',
  'science': '🔬',
  'sports': '⚽',
  'entertainment': '🎬',
  'health': '🏥'
};

const categoryLabels: Record<string, string> = {
  'general': 'General',
  'technology': 'Technology',
  'business': 'Business',
  'science': 'Science',
  'sports': 'Sports',
  'entertainment': 'Entertainment',
  'health': 'Health'
};

export default function NewsWidget({ widgetId, title }: NewsWidgetProps) {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [showAll, setShowAll] = useState(false);
  const { articles, loading, error, isDemo } = useNews(selectedCategory);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <AnimatedWidget className="ff-card-solid">
      <div className="h-full flex flex-col">
        {/* Header and status */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
          <div className="flex items-center gap-2">
            <Newspaper size={20} className="text-indigo-600" />
            <div>
              <h3 className="widget-drag-handle cursor-grab select-none font-semibold text-lg text-gray-800 active:cursor-grabbing">
                {title || 'Latest News'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-sm">
                  {isDemo ? (
                <WifiOff size={12} className="text-amber-600" />
                  ) : (
                    <Wifi size={12} className="text-emerald-600" />
                  )}
                  <span className={isDemo ? 'text-orange-600' : 'text-green-600'}>
                    {isDemo ? 'Demo Mode' : 'Live News'}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  • {articles.length} articles
                </span>
              </div>
            </div>
          </div>
          
          {/* API status */}
            <div className={`ff-news-status inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
            isDemo 
              ? 'bg-amber-50 text-amber-700' 
              : 'bg-emerald-50 text-emerald-700'
          }`}>
            {isDemo ? '🚫 Demo Data' : '✅ Live API'}
          </div>
        </div>

        {/* Categories */}
        <div className="-mx-1 mb-3 flex gap-1 overflow-x-auto px-1 pb-1">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              disabled={loading}
            >
              <span>{categoryEmojis[category]}</span>
              <span>{categoryLabels[category]}</span>
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-indigo-600" />
              <p className="text-gray-600">Loading news...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-red-600">
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* News list */}
        {!loading && !error && (
          <div className="max-h-[28rem] flex-1 space-y-3 overflow-y-auto pr-1">
            {articles.slice(0, showAll ? articles.length : 3).map((article, index) => (
              <motion.div
                key={`${article.title}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ff-news-article group block rounded-xl border-b border-slate-200 p-3 transition-colors duration-200 hover:bg-slate-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="ff-news-category inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                      <span>{categoryEmojis[article.category] || '📰'}</span>
                      <span className="capitalize">{categoryLabels[article.category] || article.category}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                      <Calendar size={10} />
                      {formatTime(article.publishedAt)}
                    </span>
                  </div>
                  
                  <h4 className="mb-2 line-clamp-2 font-semibold leading-tight text-slate-900 transition-colors group-hover:text-indigo-700">
                    {article.title}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                    {article.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="ff-news-source text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {article.source}
                    </span>
                    <div className="flex items-center gap-1 text-indigo-600 transition-colors group-hover:text-indigo-700">
                      <span className="text-xs font-medium">Read more</span>
                      <ExternalLink size={12} />
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !error && articles.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="mt-2 self-center rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
          >
            {showAll ? 'Show less' : `Show more (${articles.length - 3})`}
          </button>
        )}

        {/* Footer with API instructions */}
        <div className="mt-3 pt-2 border-t border-gray-200/50">
          <div className="text-center">
            {isDemo ? (
              <div className="space-y-1">
                <p className="text-xs text-gray-600">
                  <Key size={10} className="inline mr-1" />
                  Using demo data •{' '}
                  <a 
                    href="https://gnews.io/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline font-medium"
                  >
                    Get free API key
                  </a>
                </p>
                <p className="text-[10px] text-gray-500">Set <code>GNEWS_API_KEY</code> in Vercel to enable live headlines.</p>
              </div>
            ) : (
              <p className="text-xs text-green-600">
                ✅ Connected to GNews API • Real-time news feed
              </p>
            )}
          </div>
        </div>
      </div>
    </AnimatedWidget>
  );
}
