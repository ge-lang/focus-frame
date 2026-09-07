import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/api-auth';
import { InvalidRequestError, isAllowedWebUrl, normalizeWebUrl, parseOptionalString, readJsonObject } from '@/lib/api-validation';

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
    const body = await readJsonObject(request);
    const title = parseOptionalString(body.title, 200, 'bookmark title');
    const url = parseOptionalString(body.url, 2_000, 'bookmark URL');
    const category = parseOptionalString(body.category, 100, 'bookmark category');
    if (!title || !url || !isAllowedWebUrl(url)) {
      return NextResponse.json({ error: 'Invalid bookmark data' }, { status: 400 });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        title: title.trim(),
        url: normalizeWebUrl(url),
        category: category || null,
      },
    });
    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'A valid URL is required' }, { status: 400 });
  }
}
