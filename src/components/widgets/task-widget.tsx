// src/components/widgets/task-widget.tsx
'use client';
import { useTasks, useCreateTask } from '@/hooks/use-tasks';
import { useState } from 'react';

export default function TaskWidget() {
  const { data: tasks = [], isLoading, error } = useTasks();
  const createMutation = useCreateTask();
  const [newTask, setNewTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      createMutation.mutate({ title: newTask.trim() });
      setNewTask('');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <div className="animate-pulse">Загрузка задач...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <div className="text-red-500">Ошибка загрузки задач</div>
        <div className="text-sm text-gray-500">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="font-semibold text-lg mb-4">Задачи ({tasks.length})</h3>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Добавить новую задачу..."
            className="flex-1 border p-2 rounded-l"
            disabled={createMutation.isPending}
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-blue-500 text-white px-4 rounded-r disabled:bg-gray-400"
          >
            {createMutation.isPending ? 'Добавляем...' : 'Add'}
          </button>
        </div>
      </form>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center">
            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={() => console.log('Toggle:', task.id)}
              className="mr-2"
            />
            <span className={task.isCompleted ? 'line-through text-gray-500' : ''}>
              {task.title}
            </span>
          </div>
        ))}
        
        {tasks.length === 0 && (
          <p className="text-gray-500">Нет задач. Добавьте первую!</p>
        )}
      </div>
    </div>
  );
}