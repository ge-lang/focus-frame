import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/api-auth';

function getWidgetId(request: NextRequest) {
  return new URL(request.url).pathname.split('/').pop();
}

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  const widgetId = getWidgetId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!widgetId) return NextResponse.json({ error: 'Widget ID is required' }, { status: 400 });

  const note = await prisma.note.findUnique({
    where: { userId_widgetId: { userId, widgetId } },
  });
  return NextResponse.json({ content: note?.content ?? '' });
}

export async function PUT(request: NextRequest) {
  const userId = await getCurrentUserId();
  const widgetId = getWidgetId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!widgetId) return NextResponse.json({ error: 'Widget ID is required' }, { status: 400 });

  try {
    const { content } = await request.json();
    if (typeof content !== 'string' || content.length > 20_000) {
      return NextResponse.json({ error: 'Invalid note content' }, { status: 400 });
    }

    const note = await prisma.note.upsert({
      where: { userId_widgetId: { userId, widgetId } },
      create: { userId, widgetId, content },
      update: { content },
    });
    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
}
