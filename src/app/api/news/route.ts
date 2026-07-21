import { NextRequest, NextResponse } from 'next/server';

const categories = new Set(['general', 'world', 'nation', 'business', 'technology', 'entertainment', 'sports', 'science', 'health']);

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category') || 'general';
  if (!categories.has(category)) {
    return NextResponse.json({ error: 'Invalid news category' }, { status: 400 });
  }

  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GNews API key is not configured' }, { status: 503 });
  }

  try {
    const response = await fetch(
      `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&apikey=${apiKey}&max=10`,
      { next: { revalidate: 300 } },
    );
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch news' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ articles: data.articles ?? [] });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 502 });
  }
}
