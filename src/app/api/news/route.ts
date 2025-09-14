// src/app/api/news/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Заглушка для новостей
    const newsData = [
      {
        title: 'Технологические новости',
        description: 'Последние обновления в мире технологий',
        url: '#'
      },
      {
        title: 'Советы по продуктивности', 
        description: 'Как улучшить ваш рабочий процесс',
        url: '#'
      }
    ];

    return NextResponse.json(newsData);
  } catch {
    // Убираем неиспользуемую переменную error
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}