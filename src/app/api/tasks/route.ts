// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Prisma, TaskPriority, TaskStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { InvalidRequestError, isOneOf, parseOptionalDate, parseOptionalString, readJsonObject } from '@/lib/api-validation';
import { createdTaskHistoryEvent, normalizeTaskHistory } from '@/lib/task-history';

const taskSelect = {
  id: true,
  title: true,
  description: true,
  isCompleted: true,
  status: true,
  priority: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
} as const;

async function readTaskHistories(userId: string) {
  try {
    const rows = await prisma.$queryRaw<Array<{ id: string; history: Prisma.JsonValue | null }>>(
      Prisma.sql`SELECT "id", "history" FROM "Task" WHERE "userId" = ${userId}`,
    );
    return new Map(rows.map((row) => [row.id, normalizeTaskHistory(row.history)]));
  } catch {
    // The history migration is additive; legacy databases can still serve core task data.
    return new Map<string, ReturnType<typeof normalizeTaskHistory>>();
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [tasks, histories] = await Promise.all([prisma.task.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { ...taskSelect, focusSessions: { select: { duration: true } } },
    }), readTaskHistories(session.user.id)]);
    return NextResponse.json(tasks.map(({ focusSessions, ...task }) => ({
      ...task,
      history: histories.get(task.id) ?? [],
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
    
    const createdAt = new Date().toISOString();
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
      select: taskSelect,
    });

    const history = [createdTaskHistoryEvent(task.id, createdAt)];
    try {
      await prisma.task.update({
        where: { id: task.id },
        data: { history: history as unknown as Prisma.InputJsonValue },
        select: { id: true },
      });
    } catch {
      // A pending additive migration must never make the task itself disappear.
    }

    return NextResponse.json({ ...task, history });
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
