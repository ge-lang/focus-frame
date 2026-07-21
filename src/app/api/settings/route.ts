import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/api-auth';

const defaults = {
  dailyFocusGoal: 100,
  dailyPomodoroGoal: 4,
  notificationsEnabled: false,
};

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await prisma.userSettings.findUnique({ where: { userId } });
  return NextResponse.json(settings ?? defaults);
}

export async function PUT(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { dailyFocusGoal, dailyPomodoroGoal, notificationsEnabled } = await request.json();
    if ((dailyFocusGoal !== undefined && (!Number.isInteger(dailyFocusGoal) || dailyFocusGoal < 15 || dailyFocusGoal > 960)) ||
        (dailyPomodoroGoal !== undefined && (!Number.isInteger(dailyPomodoroGoal) || dailyPomodoroGoal < 1 || dailyPomodoroGoal > 20)) ||
        (notificationsEnabled !== undefined && typeof notificationsEnabled !== 'boolean')) {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
    }

    const data = {
      ...(dailyFocusGoal !== undefined && { dailyFocusGoal }),
      ...(dailyPomodoroGoal !== undefined && { dailyPomodoroGoal }),
      ...(notificationsEnabled !== undefined && { notificationsEnabled }),
    };
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...defaults, ...data },
      update: data,
    });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
