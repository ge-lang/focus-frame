import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/api-auth';

function normalizeUrl(url: string) {
  const value = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  return new URL(value).toString();
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(bookmarks);
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, url, category } = await request.json();
    if (typeof title !== 'string' || !title.trim() || title.length > 200 ||
        typeof url !== 'string' || !url.trim() ||
        (category !== undefined && (typeof category !== 'string' || category.length > 100))) {
      return NextResponse.json({ error: 'Invalid bookmark data' }, { status: 400 });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        title: title.trim(),
        url: normalizeUrl(url.trim()),
        category: category?.trim() || null,
      },
    });
    return NextResponse.json(bookmark, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'A valid URL is required' }, { status: 400 });
  }
}
