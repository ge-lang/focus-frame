import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/api-auth';

function getGoalId(request: NextRequest) {
  return new URL(request.url).pathname.split('/').pop();
}

export async function PUT(request: NextRequest) {
  const userId = await getCurrentUserId();
  const id = getGoalId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!id) return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });

  const { title, completed, priority, dueDate } = await request.json();
  const parsedDueDate = dueDate === undefined || dueDate === null || dueDate === '' ? null : new Date(dueDate);
  if ((title !== undefined && (typeof title !== 'string' || !title.trim() || title.length > 200)) ||
      (priority && !['low', 'medium', 'high'].includes(priority)) ||
      (completed !== undefined && typeof completed !== 'boolean') ||
      (parsedDueDate && Number.isNaN(parsedDueDate.getTime()))) {
    return NextResponse.json({ error: 'Invalid goal data' }, { status: 400 });
  }

  const goal = await prisma.goal.findFirst({ where: { id, userId } });
  if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

  const updatedGoal = await prisma.goal.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(completed !== undefined && { completed }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate: parsedDueDate }),
    },
  });
  return NextResponse.json(updatedGoal);
}

export async function DELETE(request: NextRequest) {
  const userId = await getCurrentUserId();
  const id = getGoalId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!id) return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });

  const result = await prisma.goal.deleteMany({ where: { id, userId } });
  if (!result.count) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
