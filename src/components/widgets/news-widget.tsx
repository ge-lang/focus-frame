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
    <AnimatedWidget className="bg-gradient-to-br from-blue-50 to-cyan-100">
      <div className="h-full flex flex-col">
        {/* Header and status */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
          <div className="flex items-center gap-2">
            <Newspaper size={20} className="text-blue-600" />
            <div>
              <h3 className="font-semibold text-lg text-gray-800">
                {title || 'Latest News'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-sm">
                  {isDemo ? (
                    <WifiOff size={12} className="text-orange-500" />
                  ) : (
                    <Wifi size={12} className="text-green-500" />
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
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            isDemo 
              ? 'bg-orange-100 text-orange-800' 
              : 'bg-green-100 text-green-800'
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
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
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
              <RefreshCw size={24} className="animate-spin text-blue-500 mx-auto mb-2" />
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
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {articles.slice(0, 4).map((article, index) => (
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
                  className="block p-3 bg-white/70 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 group border border-white/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      <span>{categoryEmojis[article.category] || '📰'}</span>
                      <span className="capitalize">{categoryLabels[article.category] || article.category}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                      <Calendar size={10} />
                      {formatTime(article.publishedAt)}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors mb-2 line-clamp-2 leading-tight">
                    {article.title}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                    {article.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {article.source}
                    </span>
                    <div className="flex items-center gap-1 text-blue-500 group-hover:text-blue-700 transition-colors">
                      <span className="text-xs font-medium">Read more</span>
                      <ExternalLink size={12} />
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
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
