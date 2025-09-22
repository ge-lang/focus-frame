// src/components/widgets/task-widget.tsx
'use client';
import { useState } from 'react';
import { AnimatedWidget } from '@/components/animated-widget';
import { AnimatedButton } from '@/components/animated-button';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Calendar,
  Flag,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskStatus } from '@/types/task';

interface TaskWidgetProps {
  widgetId: string;
  title?: string;
}

interface EditState {
  id: string | null;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

// Mock данные для демо
const initialTasks: Record<TaskStatus, Task[]> = {
  'todo': [
    {
      id: '1',
      title: 'Design new dashboard layout',
      description: 'Create wireframes and mockups',
      priority: 'high',
      dueDate: '2024-01-15',
      tags: ['design', 'ui'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10'
    },
    {
      id: '2',
      title: 'Buy groceries',
      description: 'Milk, eggs, bread, fruits',
      priority: 'medium',
      dueDate: '2024-01-12',
      tags: ['personal'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10'
    }
  ],
  'in-progress': [
    {
      id: '3',
      title: 'Implement drag and drop',
      description: 'Add DnD functionality for tasks',
      priority: 'high',
      dueDate: '2024-01-14',
      tags: ['development'],
      createdAt: '2024-01-09',
      updatedAt: '2024-01-10'
    }
  ],
  'done': [
    {
      id: '4',
      title: 'Set up project structure',
      description: 'Initialize Next.js project with TypeScript',
      priority: 'medium',
      dueDate: '2024-01-08',
      tags: ['setup'],
      createdAt: '2024-01-07',
      updatedAt: '2024-01-08'
    }
  ]
};

// Вспомогательные функции
const getStatusLabel = (status: TaskStatus) => {
  switch (status) {
    case 'todo': return 'To Do';
    case 'in-progress': return 'In Progress';
    case 'done': return 'Done';
    default: return status;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'red';
    case 'medium': return 'yellow';
    case 'low': return 'green';
    default: return 'gray';
  };
};

// Компонент карточки задачи
function TaskCard({ 
  task, 
  status, 
  onEdit, 
  onDelete, 
  onDragStart,
  editState,
  onSaveEdit,
  onCancelEdit 
}: { 
  task: Task;
  status: TaskStatus;
  onEdit: (task: Task, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onDragStart: (task: Task, status: TaskStatus) => void;
  editState: EditState;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  const isEditing = editState.id === task.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      draggable
      onDragStart={() => onDragStart(task, status)}
      className="bg-white rounded-lg p-3 shadow-sm border cursor-move group relative"
    >
      {/* Ручка для перетаскивания */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical size={12} className="text-gray-400" />
      </div>

      {isEditing ? (
        // Режим редактирования
        <div className="ml-4 space-y-2">
          <input
            type="text"
            value={editState.title}
            onChange={(e) => onEdit({ ...task, title: e.target.value }, status)}
            className="w-full p-1 border border-gray-300 rounded text-sm"
            autoFocus
          />
          <textarea
            value={editState.description}
            onChange={(e) => onEdit({ ...task, description: e.target.value }, status)}
            placeholder="Description"
            className="w-full p-1 border border-gray-300 rounded text-sm resize-none"
            rows={2}
          />
          <div className="flex space-x-1">
            <button
              onClick={onSaveEdit}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // Режим просмотра
        <div className="ml-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 text-sm leading-tight">{task.title}</h4>
              {task.description && (
                <p className="text-gray-600 text-xs mt-1 leading-relaxed">{task.description}</p>
              )}
            </div>
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              <button
                onClick={() => onEdit(task, status)}
                className="p-1 text-blue-600 hover:text-blue-800"
                title="Edit"
              >
                <Edit size={12} />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 text-red-600 hover:text-red-800"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
              getPriorityColor(task.priority) === 'red' ? 'bg-red-100 text-red-800' :
              getPriorityColor(task.priority) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              <Flag size={10} className="mr-1" />
              {task.priority}
            </span>
            
            {task.dueDate && (
              <span className="flex items-center text-gray-500 text-xs">
                <Calendar size={10} className="mr-1" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Компонент колонки
function TaskColumn({ 
  status, 
  tasks, 
  onDragOver, 
  onDrop, 
  onEdit, 
  onDelete, 
  onDragStart,
  editState,
  onSaveEdit,
  onCancelEdit 
}: { 
  status: TaskStatus;
  tasks: Task[];
  onDragOver: (e: React.DragEvent, status: TaskStatus) => void;
  onDrop: (e: React.DragEvent, status: TaskStatus) => void;
  onEdit: (task: Task, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onDragStart: (task: Task, status: TaskStatus) => void;
  editState: EditState;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  return (
    <div
      className="flex flex-col h-full min-h-[300px]"
      onDragOver={(e) => onDragOver(e, status)}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className={`p-3 rounded-t-lg text-center font-medium ${
        status === 'todo' ? 'bg-blue-100 text-blue-800' :
        status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
        'bg-green-100 text-green-800'
      }`}>
        <div className="font-semibold text-sm">{getStatusLabel(status)}</div>
        <div className="text-xs opacity-75">{tasks.length} tasks</div>
      </div>
      
      <div className={`flex-1 overflow-y-auto p-3 space-y-3 ${
        status === 'todo' ? 'bg-blue-50' :
        status === 'in-progress' ? 'bg-yellow-50' :
        'bg-green-50'
      } rounded-b-lg`}>
        <AnimatePresence>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              status={status}
              onEdit={onEdit}
              onDelete={onDelete}
              onDragStart={onDragStart}
              editState={editState}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
            />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}

// Основной компонент
export default function TaskWidget({ widgetId, title }: TaskWidgetProps) {
  const [tasks, setTasks] = useState<Record<TaskStatus, Task[]>>(initialTasks);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });
  const [editState, setEditState] = useState<EditState>({ 
    id: null, 
    title: '', 
    description: '', 
    priority: 'medium',
    dueDate: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; status: TaskStatus } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setTasks(prev => ({
        ...prev,
        todo: [...prev.todo, task]
      }));
      
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
      setIsAdding(false);
    }
  };

  const handleEdit = (task: Task, status: TaskStatus) => {
    setEditState({ 
      id: task.id, 
      title: task.title, 
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate || ''
    });
  };

  const handleSaveEdit = () => {
    if (editState.id && editState.title.trim()) {
      setTasks(prev => {
        const updatedTasks = { ...prev };
        Object.keys(updatedTasks).forEach(status => {
          const taskIndex = updatedTasks[status as TaskStatus].findIndex(t => t.id === editState.id);
          if (taskIndex !== -1) {
            updatedTasks[status as TaskStatus][taskIndex] = {
              ...updatedTasks[status as TaskStatus][taskIndex],
              title: editState.title.trim(),
              description: editState.description.trim(),
              priority: editState.priority,
              dueDate: editState.dueDate,
              updatedAt: new Date().toISOString()
            };
          }
        });
        return updatedTasks;
      });
      setEditState({ id: null, title: '', description: '', priority: 'medium', dueDate: '' });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => {
        const updatedTasks = { ...prev };
        Object.keys(updatedTasks).forEach(status => {
          updatedTasks[status as TaskStatus] = updatedTasks[status as TaskStatus].filter(t => t.id !== id);
        });
        return updatedTasks;
      });
    }
  };

  // Drag and Drop функции
  const handleDragStart = (task: Task, status: TaskStatus) => {
    setDraggedTask({ task, status });
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      setTasks(prev => {
        const updatedTasks = { ...prev };
        
        // Удаляем задачу из старого статуса
        updatedTasks[draggedTask.status] = updatedTasks[draggedTask.status].filter(
          t => t.id !== draggedTask.task.id
        );
        
        // Добавляем задачу в новый статус
        updatedTasks[newStatus] = [
          ...updatedTasks[newStatus],
          { ...draggedTask.task, updatedAt: new Date().toISOString() }
        ];
        
        return updatedTasks;
      });
    }
    setDraggedTask(null);
  };

  const totalTasks = Object.values(tasks).reduce((sum, statusTasks) => sum + statusTasks.length, 0);
  const completedTasks = tasks.done.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <AnimatedWidget className="bg-gradient-to-br from-purple-50 to-indigo-100 w-full">
      <div className="h-full flex flex-col">
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <div>
            <h3 className="font-semibold text-lg text-gray-800">
              {title || 'Tasks'}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className="text-xs text-gray-600">
                {completedTasks}/{totalTasks} completed
              </div>
              <div className="w-16 bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
          
          <AnimatedButton
            onClick={() => setIsAdding(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm w-full sm:w-auto"
          >
            <Plus size={16} className="mr-1" />
            Add Task
          </AnimatedButton>
        </div>

        {/* Форма добавления задачи */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-white/50 rounded-lg"
            >
              <form onSubmit={handleSubmit} className="space-y-2">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  autoFocus
                />
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Description (optional)"
                  className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 text-white py-2 rounded text-sm hover:bg-green-600"
                  >
                    Add Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 bg-gray-500 text-white py-2 rounded text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Адаптивная сетка колонок */}
        <div className="flex-1">
          {/* Десктоп: 3 колонки */}
          <div className="hidden lg:grid grid-cols-3 gap-4 h-full">
            {(Object.entries(tasks) as [TaskStatus, Task[]][]).map(([status, statusTasks]) => (
              <TaskColumn
                key={status}
                status={status as TaskStatus}
                tasks={statusTasks}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDragStart={handleDragStart}
                editState={editState}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => setEditState({ id: null, title: '', description: '', priority: 'medium', dueDate: '' })}
              />
            ))}
          </div>

          {/* Планшет: 2 колонки */}
          <div className="hidden md:grid lg:hidden grid-cols-2 gap-4 h-full">
            {(Object.entries(tasks).slice(0, 2) as [TaskStatus, Task[]][]).map(([status, statusTasks]) => (
              <TaskColumn
                key={status}
                status={status as TaskStatus}
                tasks={statusTasks}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDragStart={handleDragStart}
                editState={editState}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => setEditState({ id: null, title: '', description: '', priority: 'medium', dueDate: '' })}
              />
            ))}
          </div>

          {/* Мобильные: горизонтальная прокрутка */}
          <div className="md:hidden flex overflow-x-auto pb-4 space-x-4 h-full">
            <div className="flex space-x-4 min-w-max">
              {(Object.entries(tasks) as [TaskStatus, Task[]][]).map(([status, statusTasks]) => (
                <div key={status} className="w-64 flex-shrink-0">
                  <TaskColumn
                    status={status as TaskStatus}
                    tasks={statusTasks}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDragStart={handleDragStart}
                    editState={editState}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={() => setEditState({ id: null, title: '', description: '', priority: 'medium', dueDate: '' })}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedWidget>
  );
}