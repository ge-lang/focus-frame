import { NextRequest, NextResponse } from 'next/server';
import { Prisma, TaskPriority, TaskStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { InvalidRequestError, isOneOf, parseOptionalDate, parseOptionalString, readJsonObject } from '@/lib/api-validation';
import { normalizeTaskHistory, taskHistoryChanges } from '@/lib/task-history';

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

async function readTaskHistory(userId: string, taskId: string) {
  try {
    const rows = await prisma.$queryRaw<Array<{ history: Prisma.JsonValue | null }>>(
      Prisma.sql`SELECT "history" FROM "Task" WHERE "id" = ${taskId} AND "userId" = ${userId}`,
    );
    return normalizeTaskHistory(rows[0]?.history);
  } catch {
    // The history migration is additive; legacy databases can still update core task data.
    return [];
  }
}

function getTaskId(request: NextRequest) {
  return new URL(request.url).pathname.split('/').pop();
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = getTaskId(request);
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const body = await readJsonObject(request);
    const title = parseOptionalString(body.title, 200, 'task title');
    const description = parseOptionalString(body.description, 2_000, 'task description');
    const isCompleted = body.isCompleted;
    const priority = body.priority;
    const status = body.status;
    const dueDate = parseOptionalDate(body.dueDate);
    if (title !== undefined && !title) return NextResponse.json({ error: 'Task title cannot be empty' }, { status: 400 });

    const validPriorities = [TaskPriority.low, TaskPriority.medium, TaskPriority.high];
    const validStatuses = [TaskStatus.todo, TaskStatus.in_progress, TaskStatus.done];
    const parsedPriority = priority === undefined ? undefined : isOneOf(priority, validPriorities) ? priority : null;
    const parsedStatus = status === undefined ? undefined : isOneOf(status, validStatuses) ? status : null;
    if (parsedPriority === null || parsedStatus === null ||
        (isCompleted !== undefined && typeof isCompleted !== 'boolean')) {
      return NextResponse.json({ error: 'Invalid task data' }, { status: 400 });
    }

    const existingTask = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
      select: taskSelect,
    });
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const nextStatus = parsedStatus ?? (isCompleted === undefined ? existingTask.status : isCompleted ? TaskStatus.done : TaskStatus.todo);
    const nextPriority = parsedPriority ?? existingTask.priority;
    const nextDueDate = dueDate === undefined ? existingTask.dueDate : dueDate;
    const historyTimestamp = new Date().toISOString();
    const existingHistory = await readTaskHistory(session.user.id, existingTask.id);
    const historyEvents = taskHistoryChanges(
      { status: existingTask.status, priority: existingTask.priority, dueDate: existingTask.dueDate?.toISOString() ?? null },
      { status: nextStatus, priority: nextPriority, dueDate: nextDueDate?.toISOString() ?? null },
      existingTask.id,
      historyTimestamp,
    );

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description || null }),
        ...(parsedPriority !== undefined && { priority: parsedPriority }),
        ...(dueDate !== undefined && { dueDate }),
        ...(parsedStatus !== undefined && { status: parsedStatus, isCompleted: parsedStatus === TaskStatus.done }),
        ...(isCompleted !== undefined && { isCompleted }),
      },
      select: taskSelect,
    });

    const history = [...existingHistory, ...historyEvents];
    if (historyEvents.length > 0) {
      try {
        await prisma.task.update({
          where: { id: existingTask.id },
          data: { history: history as unknown as Prisma.InputJsonValue },
          select: { id: true },
        });
      } catch {
        // History is supplementary; the edited task has already been persisted.
      }
    }

    return NextResponse.json({ ...task, history });
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = getTaskId(request);
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const result = await prisma.task.deleteMany({
      where: { id, userId: session.user.id },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
