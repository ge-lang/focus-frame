// src/app/api/news/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // News placeholder
    const newsData = [
      {
        title: 'Technology News',
        description: 'The latest updates from the world of technology',
        url: '#'
      },
      {
        title: 'Productivity Tips',
        description: 'How to improve your workflow',
        url: '#'
      }
    ];

    return NextResponse.json(newsData);
  } catch {
    // Remove the unused error variable
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
