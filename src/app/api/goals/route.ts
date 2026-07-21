import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/api-auth';

const validPriorities = ['low', 'medium', 'high'];

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
    const { title, priority, dueDate } = await request.json();
    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    if (typeof title !== 'string' || !title.trim() || title.length > 200 ||
        (priority && !validPriorities.includes(priority)) ||
        (parsedDueDate && Number.isNaN(parsedDueDate.getTime()))) {
      return NextResponse.json({ error: 'Invalid goal data' }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: { userId, title: title.trim(), priority: priority || 'medium', dueDate: parsedDueDate },
    });
    return NextResponse.json(goal, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}
