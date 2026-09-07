import { NextRequest, NextResponse } from 'next/server';
import { isIntegerBetween } from '@/lib/api-validation';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/api-auth';
import { InvalidRequestError, readJsonObject } from '@/lib/api-validation';

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
    const body = await readJsonObject(request);
    const { dailyFocusGoal, dailyPomodoroGoal, notificationsEnabled } = body;
    if ((dailyFocusGoal !== undefined && !isIntegerBetween(dailyFocusGoal, 15, 960)) ||
        (dailyPomodoroGoal !== undefined && !isIntegerBetween(dailyPomodoroGoal, 1, 20)) ||
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
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
