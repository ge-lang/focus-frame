import { NextRequest, NextResponse } from 'next/server';
import { TaskPriority } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/api-auth';
import { InvalidRequestError, isOneOf, parseOptionalDate, parseOptionalString, readJsonObject } from '@/lib/api-validation';

const validPriorities = [TaskPriority.low, TaskPriority.medium, TaskPriority.high];

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await readJsonObject(request);
    const title = parseOptionalString(body.title, 200, 'goal title');
    const priority = body.priority;
    const dueDate = parseOptionalDate(body.dueDate);
    const parsedPriority = priority === undefined ? TaskPriority.medium : isOneOf(priority, validPriorities) ? priority : null;
    if (!title || !parsedPriority) {
      return NextResponse.json({ error: 'Invalid goal data' }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: { userId, title, priority: parsedPriority, dueDate: dueDate ?? null },
    });
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}
