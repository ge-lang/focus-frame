import { NextRequest, NextResponse } from 'next/server';
import { TaskPriority } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/api-auth';
import { InvalidRequestError, isOneOf, parseOptionalDate, parseOptionalString, readJsonObject } from '@/lib/api-validation';

function getGoalId(request: NextRequest) {
  return new URL(request.url).pathname.split('/').pop();
}

export async function PUT(request: NextRequest) {
  const userId = await getCurrentUserId();
  const id = getGoalId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!id) return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await readJsonObject(request);
  } catch (error) {
    if (error instanceof InvalidRequestError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: 'Failed to read goal data' }, { status: 500 });
  }
  let title: string | undefined;
  let completed: unknown;
  let priority: unknown;
  let dueDate: Date | null | undefined;
  try {
    title = parseOptionalString(body.title, 200, 'goal title');
    completed = body.completed;
    priority = body.priority;
    dueDate = parseOptionalDate(body.dueDate);
  } catch (error) {
    if (error instanceof InvalidRequestError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: 'Failed to read goal data' }, { status: 500 });
  }
  const parsedPriority = priority === undefined ? undefined : isOneOf(priority, [TaskPriority.low, TaskPriority.medium, TaskPriority.high]) ? priority : null;
  if ((title !== undefined && !title) ||
      parsedPriority === null ||
      (completed !== undefined && typeof completed !== 'boolean')) {
    return NextResponse.json({ error: 'Invalid goal data' }, { status: 400 });
  }

  try {
    const goal = await prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(completed !== undefined && { completed }),
        ...(parsedPriority !== undefined && { priority: parsedPriority }),
        ...(dueDate !== undefined && { dueDate }),
      },
    });
    return NextResponse.json(updatedGoal);
  } catch {
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getCurrentUserId();
  const id = getGoalId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!id) return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });

  try {
    const result = await prisma.goal.deleteMany({ where: { id, userId } });
    if (!result.count) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
