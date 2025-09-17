// src/components/widgets/task-widget.tsx
'use client';
import { useTasks, useCreateTask, useUpdateTask } from '@/hooks/use-tasks';
import { useState } from 'react';
import { AnimatedWidget } from '@/components/animated-widget';
import { AnimatedButton } from '@/components/animated-button';
import { Plus, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaskWidget() {
  const { data: tasks = [], isLoading, error } = useTasks();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const [newTask, setNewTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      createMutation.mutate({ title: newTask.trim() });
      setNewTask('');
    }
  };

  const handleToggle = (id: string, isCompleted: boolean) => {
    updateMutation.mutate({ id, isCompleted: !isCompleted });
  };

  if (isLoading) {
    return (
      <AnimatedWidget>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AnimatedWidget>
    );
  }

  return (
    <AnimatedWidget>
      <h3 className="font-semibold text-lg mb-4">Tasks ({tasks.length})</h3>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add new task..."
            className="flex-1 border p-2 rounded-l"
            disabled={createMutation.isPending}
          />
          <AnimatedButton
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-l-none"
          >
            {createMutation.isPending ? 'Adding...' : <Plus size={20} />}
          </AnimatedButton>
        </div>
      </form>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
            >
              <div className="flex items-center">
                <motion.input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => handleToggle(task.id, task.isCompleted)}
                  className="mr-2"
                  whileTap={{ scale: 0.9 }}
                />
                <span className={task.isCompleted ? 'line-through text-gray-500' : ''}>
                  {task.title}
                </span>
              </div>
              
              {task.isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-500"
                >
                  <Check size={16} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 text-center"
          >
            No tasks yet. Add one above!
          </motion.p>
        )}
      </div>
    </AnimatedWidget>
  );
}