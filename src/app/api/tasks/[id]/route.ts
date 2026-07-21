import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

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

    const { title, description, isCompleted, priority, dueDate, status } = await request.json();
    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return NextResponse.json({ error: 'Task title cannot be empty' }, { status: 400 });
    }

    const validPriorities = ['low', 'medium', 'high'];
    const validStatuses = ['todo', 'in_progress', 'done'];
    const parsedDueDate = dueDate === undefined || dueDate === null || dueDate === '' ? null : new Date(dueDate);
    if ((priority && !validPriorities.includes(priority)) ||
        (status && !validStatuses.includes(status)) ||
        (parsedDueDate && Number.isNaN(parsedDueDate.getTime()))) {
      return NextResponse.json({ error: 'Invalid task data' }, { status: 400 });
    }

    const existingTask = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: typeof description === 'string' && description.trim() ? description.trim() : null }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: parsedDueDate }),
        ...(status !== undefined && { status, isCompleted: status === 'done' }),
        ...(isCompleted !== undefined && { isCompleted }),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
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
