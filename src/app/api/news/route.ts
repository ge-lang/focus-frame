// src/app/api/news/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const API_KEY = process.env.NEWS_API_KEY;
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=technology&pageSize=3&apiKey=${API_KEY}`
    );
    
    const data = await response.json();
    return NextResponse.json(data.articles);
  } catch (error) {
    // Заглушка
    return NextResponse.json([
      {
        title: 'Tech News',
        description: 'Latest updates in technology',
        url: '#'
      },
      {
        title: 'Productivity tips', 
        description: 'How to improve your workflow',
        url: '#'
      }
    ]);
  }
}