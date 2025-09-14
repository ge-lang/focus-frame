// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Исправляем типы параметров для Next.js 15
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // Новый формат в Next.js 15
) {
  try {
    const { id } = await context.params; // await для Promise
    const { isCompleted } = await req.json();
    
    const task = await prisma.task.update({
      where: { id },
      data: { isCompleted },
    });
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// Добавляем DELETE метод с правильными типами
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    await prisma.task.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}