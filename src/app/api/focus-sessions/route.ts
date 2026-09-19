import { NextRequest, NextResponse } from 'next/server';
import { FocusSessionType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/api-auth';
import { InvalidRequestError, isOneOf, readJsonObject } from '@/lib/api-validation';

const validTypes = [FocusSessionType.work, FocusSessionType.break, FocusSessionType.long_break];

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let diagnosticBody: Record<string, unknown> = {};
  try {
    const body = await readJsonObject(request);
    diagnosticBody = body;
    const duration = body.duration;
    const type = body.type;
    const taskId = body.taskId;
    const parsedType = isOneOf(type, validTypes) ? type : null;
    if (typeof duration !== 'number' || !Number.isInteger(duration) || duration < 1 || duration > 14_400 || !parsedType) {
      return NextResponse.json({ error: 'Invalid focus session' }, { status: 400 });
    }

    if (taskId !== undefined && taskId !== null) {
      if (typeof taskId !== 'string') {
        return NextResponse.json({ error: 'Invalid task' }, { status: 400 });
      }
      const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
      if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const session = await prisma.focusSession.create({ data: { userId, duration, type: parsedType, taskId: taskId || null } });
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Failed to save focus session', {
      userId,
      duration: diagnosticBody.duration,
      type: diagnosticBody.type,
      taskId: typeof diagnosticBody.taskId === 'string' ? diagnosticBody.taskId : null,
      error,
    });
    return NextResponse.json({ error: 'Failed to save focus session' }, { status: 500 });
  }
}
