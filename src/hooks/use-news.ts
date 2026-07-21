// src/hooks/use-news.ts
'use client';
import { useState, useEffect } from 'react';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
  image?: string;
}

interface NewsData {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  isDemo: boolean;
}

// Mock data for demo mode
const mockNews: NewsArticle[] = [
  {
    title: 'New AI Breakthrough in Medical Research',
    description: 'Scientists develop revolutionary AI algorithm for early disease detection that could save millions of lives worldwide.',
    url: 'https://example.com/ai-breakthrough',
    source: 'Tech News Daily',
    publishedAt: new Date().toISOString(),
    category: 'technology'
  },
  {
    title: 'Global Climate Summit Reaches Historic Agreement',
    description: 'World leaders commit to ambitious carbon reduction targets in unprecedented international cooperation.',
    url: 'https://example.com/climate-summit',
    source: 'World News Network',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'politics'
  },
  {
    title: 'Stock Market Reaches All-Time High',
    description: 'Major indices surge amid positive economic indicators and strong corporate earnings reports.',
    url: 'https://example.com/stock-market',
    source: 'Financial Times',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    category: 'business'
  },
  {
    title: 'Breakthrough in Renewable Energy Storage',
    description: 'New battery technology promises longer lifespan and significantly lower costs for solar energy systems.',
    url: 'https://example.com/energy-storage',
    source: 'Science Daily',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    category: 'science'
  },
  {
    title: 'Major Sports Championship Finals This Weekend',
    description: 'Top athletes prepare for the ultimate showdown in the international championship finals.',
    url: 'https://example.com/sports-finals',
    source: 'Sports Central',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    category: 'sports'
  },
  {
    title: 'New Blockbuster Movie Breaks Box Office Records',
    description: 'The highly anticipated film surpasses all expectations with record-breaking opening weekend numbers.',
    url: 'https://example.com/box-office',
    source: 'Entertainment Weekly',
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    category: 'entertainment'
  }
];

export function useNews(category: string = 'general') {
  const [news, setNews] = useState<NewsData>({
    articles: [],
    loading: true,
    error: null,
    isDemo: true
  });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setNews(prev => ({ ...prev, loading: true, error: null }));

        // Fetch live data through the server so the API key stays private.
        const response = await fetch(`/api/news?category=${encodeURIComponent(category)}`);

        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }

        const data = await response.json();

        const realArticles: NewsArticle[] = data.articles.map((article: any) => ({
          title: article.title,
          description: article.description || 'No description available',
          url: article.url,
          source: article.source?.name || 'Unknown Source',
          publishedAt: article.publishedAt,
          category: category,
          image: article.image
        }));

        setNews({
          articles: realArticles,
          loading: false,
          error: null,
          isDemo: false
        });

      } catch (error) {
        console.error('Error fetching news:', error);
        // Use demo data if an error occurs
        setNews({
          articles: mockNews,
          loading: false,
          error: 'Failed to load real news. Using demo data.',
          isDemo: true
        });
      }
    };

    fetchNews();
  }, [category]);

  return news;
}
