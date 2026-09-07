// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { InvalidRequestError, isOneOf, parseOptionalDate, parseOptionalString, readJsonObject } from '@/lib/api-validation';

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

    const body = await readJsonObject(req);
    const title = parseOptionalString(body.title, 200, 'task title');
    const description = parseOptionalString(body.description, 2_000, 'task description');
    const priority = body.priority;
    const status = body.status;
    const dueDate = parseOptionalDate(body.dueDate);
    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const validPriorities = [TaskPriority.low, TaskPriority.medium, TaskPriority.high];
    const validStatuses = [TaskStatus.todo, TaskStatus.in_progress, TaskStatus.done];
    const parsedPriority = priority === undefined ? TaskPriority.medium : isOneOf(priority, validPriorities) ? priority : null;
    const parsedStatus = status === undefined ? TaskStatus.todo : isOneOf(status, validStatuses) ? status : null;
    if (!parsedPriority || !parsedStatus) {
      return NextResponse.json({ error: 'Invalid task data' }, { status: 400 });
    }
    
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description || null,
        priority: parsedPriority,
        status: parsedStatus,
        dueDate: dueDate ?? null,
        isCompleted: parsedStatus === TaskStatus.done,
        userId: session.user.id,
      },
    });
    
    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
