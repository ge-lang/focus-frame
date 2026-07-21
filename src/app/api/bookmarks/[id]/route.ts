import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/api-auth';

function getBookmarkId(request: NextRequest) {
  return new URL(request.url).pathname.split('/').pop();
}

export async function DELETE(request: NextRequest) {
  const userId = await getCurrentUserId();
  const id = getBookmarkId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!id) return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 });

  const result = await prisma.bookmark.deleteMany({ where: { id, userId } });
  if (!result.count) return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
