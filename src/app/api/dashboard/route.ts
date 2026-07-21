import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type PersistedDashboardState = {
  widgets: unknown[];
  layout: unknown[];
};

function isDashboardState(value: unknown): value is PersistedDashboardState {
  if (!value || typeof value !== 'object') return false;
  const state = value as PersistedDashboardState;
  return Array.isArray(state.widgets) && Array.isArray(state.layout);
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

  try {
    const { state } = await request.json();
    if (!isDashboardState(state)) {
      return NextResponse.json({ error: 'Invalid dashboard state' }, { status: 400 });
    }

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
