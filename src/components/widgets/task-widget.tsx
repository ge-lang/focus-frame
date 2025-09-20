// src/components/widgets/task-widget.tsx
'use client';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/use-tasks';
import { useState } from 'react';
import { AnimatedWidget } from '@/components/animated-widget';
import { AnimatedButton } from '@/components/animated-button';
import { Plus, Check, Trash2, Edit, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditState {
  id: string | null;
  title: string;
}

export default function TaskWidget() {
  const { data: tasks = [], isLoading, error } = useTasks();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const [newTask, setNewTask] = useState('');
  const [editState, setEditState] = useState<EditState>({ id: null, title: '' });

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

  const handleEdit = (task: { id: string; title: string }) => {
    setEditState({ id: task.id, title: task.title });
  };

  const handleSaveEdit = () => {
    if (editState.id && editState.title.trim()) {
      updateMutation.mutate(
        { id: editState.id, title: editState.title.trim() },
        {
          onSuccess: () => {
            setEditState({ id: null, title: '' });
          }
        }
      );
    }
  };

  const handleCancelEdit = () => {
    setEditState({ id: null, title: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate(id);
    }
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

  if (error) {
    return (
      <AnimatedWidget>
        <div className="text-red-500">Error loading tasks: {error.message}</div>
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
          <button
            type="submit"
            disabled={createMutation.isPending || !newTask.trim()}
            className="rounded-l-none bg-blue-500 text-white p-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Adding...' : <Plus size={20} />}
          </button>
        </div>
      </form>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-50 group"
            >
              {/* Чекбокс и текст задачи */}
              <div className="flex items-center flex-1">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => handleToggle(task.id, task.isCompleted)}
                  className="mr-2"
                  disabled={updateMutation.isPending}
                  aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                />
                
                {editState.id === task.id ? (
                  <input
                    type="text"
                    value={editState.title}
                    onChange={(e) => setEditState({ ...editState, title: e.target.value })}
                    className="flex-1 border p-1 rounded"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                ) : (
                  <span className={task.isCompleted ? 'line-through text-gray-500' : ''}>
                    {task.title}
                  </span>
                )}
              </div>

              {/* Иконки действий */}
              <div className="flex items-center space-x-2 ml-2">
                {editState.id === task.id ? (
                  <>
                    <AnimatedButton
                      onClick={handleSaveEdit}
                      disabled={!editState.title.trim() || updateMutation.isPending}
                      className="p-1 bg-green-500"
                    >
                      {updateMutation.isPending ? '...' : <Save size={14} />}
                    </AnimatedButton>
                    <AnimatedButton
                      onClick={handleCancelEdit}
                      className="p-1 bg-gray-500"
                      disabled={updateMutation.isPending}
                    >
                      <X size={14} />
                    </AnimatedButton>
                  </>
                ) : (
                  <>
                    <AnimatedButton
                      onClick={() => handleEdit(task)}
                      className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={updateMutation.isPending}
                    >
                      <Edit size={14} />
                    </AnimatedButton>
                    <AnimatedButton
                      onClick={() => handleDelete(task.id)}
                      className="p-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? '...' : <Trash2 size={14} />}
                    </AnimatedButton>
                  </>
                )}
                
                {task.isCompleted && editState.id !== task.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-500"
                  >
                    <Check size={16} />
                  </motion.div>
                )}
              </div>
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

      {/* Статус загрузки */}
      {(updateMutation.isPending || deleteMutation.isPending) && (
        <div className="mt-2 text-sm text-gray-500">
          Saving changes...
        </div>
      )}
    </AnimatedWidget>
  );
}