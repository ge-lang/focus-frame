// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { focusSessions: { select: { duration: true } } },
    });
    return NextResponse.json(tasks.map(({ focusSessions, ...task }) => ({
      ...task,
      focusSeconds: focusSessions.reduce((total, session) => total + session.duration, 0),
    })));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, priority, dueDate, status } = await req.json();
    if (typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const validPriorities = ['low', 'medium', 'high'];
    const validStatuses = ['todo', 'in_progress', 'done'];
    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    if ((priority && !validPriorities.includes(priority)) ||
        (status && !validStatuses.includes(status)) ||
        (parsedDueDate && Number.isNaN(parsedDueDate.getTime()))) {
      return NextResponse.json({ error: 'Invalid task data' }, { status: 400 });
    }
    
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: typeof description === 'string' && description.trim() ? description.trim() : null,
        priority: priority || 'medium',
        status: status || 'todo',
        dueDate: parsedDueDate,
        isCompleted: status === 'done',
        userId: session.user.id,
      },
    });
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
