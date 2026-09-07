import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isIntegerBetween } from '@/lib/api-validation';

type PersistedDashboardState = {
  widgets: unknown[];
  layout: unknown[];
};

const widgetTypes = new Set(['todo', 'weather', 'news', 'pomodoro', 'calendar', 'notes', 'analytics', 'bookmarks', 'goals']);
const MAX_WIDGETS = 20;
const MAX_LAYOUT_ITEMS = 20;
const MAX_GRID_SIZE = 12;
const MAX_BODY_BYTES = 100_000;

function isDashboardState(value: unknown): value is PersistedDashboardState {
  if (!value || typeof value !== 'object') return false;
  const state = value as PersistedDashboardState;
  if (!Array.isArray(state.widgets) || !Array.isArray(state.layout) ||
      state.widgets.length > MAX_WIDGETS || state.layout.length > MAX_LAYOUT_ITEMS) return false;

  const widgetIds = new Set<string>();
  for (const widget of state.widgets) {
    if (!widget || typeof widget !== 'object') return false;
    const item = widget as Record<string, unknown>;
    if (typeof item.id !== 'string' || item.id.length < 1 || item.id.length > 100 || widgetIds.has(item.id) ||
        typeof item.type !== 'string' || !widgetTypes.has(item.type) ||
        !isIntegerBetween(item.colSpan, 1, 4) ||
        (item.rowSpan !== undefined && !isIntegerBetween(item.rowSpan, 1, 4))) {
      return false;
    }
    widgetIds.add(item.id);
  }

  const layoutIds = new Set<string>();
  for (const layout of state.layout) {
    if (!layout || typeof layout !== 'object') return false;
    const item = layout as Record<string, unknown>;
    if (typeof item.i !== 'string' || !widgetIds.has(item.i) || layoutIds.has(item.i) ||
        typeof item.type !== 'string' || !widgetTypes.has(item.type) ||
        !isIntegerBetween(item.x, 0, MAX_GRID_SIZE) ||
        !isIntegerBetween(item.y, 0, MAX_GRID_SIZE) ||
        !isIntegerBetween(item.w, 1, 4) ||
        !isIntegerBetween(item.h, 1, 4)) {
      return false;
    }
    layoutIds.add(item.i);
  }

  return widgetIds.size === layoutIds.size;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userLayout = await prisma.userLayout.findUnique({
    where: { userId: session.user.id },
  });
  if (!userLayout) {
    return NextResponse.json({ state: null });
  }

  try {
    const state = JSON.parse(userLayout.layout);
    return NextResponse.json({ state: isDashboardState(state) ? state : null });
  } catch {
    return NextResponse.json({ state: null });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Dashboard payload is too large' }, { status: 400 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid dashboard state' }, { status: 400 });
  }
  const { state } = body as { state?: unknown };
  if (!isDashboardState(state)) {
    return NextResponse.json({ error: 'Invalid dashboard state' }, { status: 400 });
  }

  try {
    await prisma.userLayout.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, layout: JSON.stringify(state) },
      update: { layout: JSON.stringify(state) },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save dashboard' }, { status: 500 });
  }
}
