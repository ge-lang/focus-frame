// src/components/widgets/news-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';
import { motion } from 'framer-motion';



// src/components/widgets/news-widget.tsx  
interface NewsWidgetProps {
  widgetId: string;
  title?: string;
}



const newsItems = [
  {
    id: 1,
    title: 'New React Features Released',
    source: 'React Blog',
    time: '2h ago',
    category: 'Technology'
  },
  {
    id: 2,
    title: 'AI Revolution in 2024',
    source: 'Tech News',
    time: '4h ago',
    category: 'AI'
  },
  {
    id: 3,
    title: 'Climate Change Summit',
    source: 'World News',
    time: '6h ago',
    category: 'Environment'
  }
];

export default function NewsWidget({ widgetId, title }: NewsWidgetProps)  {
  return (
    <AnimatedWidget className="bg-gradient-to-br from-blue-50 to-cyan-100">
      <div className="h-full">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">News</h3>
        
        <div className="space-y-3">
          {newsItems.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {news.category}
                </span>
                <span className="text-xs text-gray-500">{news.time}</span>
              </div>
              <h4 className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                {news.title}
              </h4>
              <p className="text-xs text-gray-600 mt-1">{news.source}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          View All News
        </motion.button>
      </div>
    </AnimatedWidget>
  );
}