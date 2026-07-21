import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/api-auth';

const validTypes = ['work', 'break', 'long_break'];

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { duration, type, taskId } = await request.json();
    if (!Number.isInteger(duration) || duration < 60 || duration > 14_400 || !validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid focus session' }, { status: 400 });
    }

    if (taskId !== undefined && taskId !== null) {
      if (typeof taskId !== 'string') {
        return NextResponse.json({ error: 'Invalid task' }, { status: 400 });
      }
      const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
      if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const session = await prisma.focusSession.create({ data: { userId, duration, type, taskId: taskId || null } });
    return NextResponse.json(session, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to save focus session' }, { status: 500 });
  }
}
