// src/app/api/tasks/route.ts
import { NextResponse } from 'next/server';

// Временная заглушка для тестирования
const mockTasks = [
  { id: '1', title: 'Пример задачи 1', isCompleted: false, createdAt: new Date() },
  { id: '2', title: 'Пример задачи 2', isCompleted: true, createdAt: new Date() },
];

export async function GET() {
  try {
    console.log('✅ API: Возвращаем mock задачи');
    return NextResponse.json(mockTasks);
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    const newTask = {
      id: Date.now().toString(),
      title: title || 'Новая задача',
      isCompleted: false,
      createdAt: new Date(),
    };
    mockTasks.push(newTask);
    
    console.log('✅ API: Создана новая задача:', newTask);
    return NextResponse.json(newTask);
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}