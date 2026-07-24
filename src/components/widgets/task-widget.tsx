// src/components/widgets/task-widget.tsx
'use client';
import { useMemo, useState } from 'react';
import { AnimatedWidget } from '@/components/animated-widget';
import { AnimatedButton } from '@/components/animated-button';
import {
  Plus, 
  Trash2, 
  Edit, 
  Calendar,
  Flag,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskStatus } from '@/types/task';
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from '@/hooks/use-tasks';

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

type DueDateFilter = 'all' | 'overdue' | 'today' | 'upcoming' | 'none';

// Helper functions
const getStatusLabel = (status: TaskStatus) => {
  switch (status) {
    case 'todo': return 'To Do';
    case 'in_progress': return 'In Progress';
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

const formatFocusTime = (seconds?: number) => {
  if (!seconds) return null;
  const minutes = Math.round(seconds / 60);
  return minutes < 60 ? `${minutes}m focused` : `${Math.floor(minutes / 60)}h ${minutes % 60}m focused`;
};

const getDueDateMeta = (dueDate: string | null) => {
  if (!dueDate) return null;

  const date = new Date(`${dueDate.slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date < today) return { label: 'Overdue', className: 'text-red-600 font-medium', type: 'overdue' as const };
  if (date.getTime() === today.getTime()) return { label: 'Due today', className: 'text-orange-600 font-medium', type: 'today' as const };
  if (date.getTime() === tomorrow.getTime()) return { label: 'Due tomorrow', className: 'text-yellow-700 font-medium', type: 'upcoming' as const };
  return { label: date.toLocaleDateString(), className: 'text-gray-500', type: 'upcoming' as const };
};

// Task card component
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
      {/* Drag handle */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical size={12} className="text-gray-400" />
      </div>

      {isEditing ? (
        // Edit mode
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
        // View mode
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
            
            {getDueDateMeta(task.dueDate) && (
              <span className={`flex items-center text-xs ${getDueDateMeta(task.dueDate)?.className}`}>
                <Calendar size={10} className="mr-1" />
                {getDueDateMeta(task.dueDate)?.label}
              </span>
            )}
          </div>
          {formatFocusTime(task.focusSeconds) && (
            <p className="text-xs text-purple-600 mt-2">⏱ {formatFocusTime(task.focusSeconds)}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Column component
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
      className="flex h-full min-h-0 flex-col"
      onDragOver={(e) => onDragOver(e, status)}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className={`p-3 rounded-t-lg text-center font-medium ${
        status === 'todo' ? 'bg-blue-100 text-blue-800' :
        status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
        'bg-green-100 text-green-800'
      }`}>
        <div className="font-semibold text-sm">{getStatusLabel(status)}</div>
        <div className="text-xs opacity-75">{tasks.length} tasks</div>
      </div>
      
      <div className={`min-h-0 flex-1 overflow-y-auto p-3 space-y-3 ${
        status === 'todo' ? 'bg-blue-50' :
        status === 'in_progress' ? 'bg-yellow-50' :
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

// Main component
export default function TaskWidget({ widgetId, title }: TaskWidgetProps) {
  const { data: tasks = [], isLoading } = useTasks();
  const { mutateAsync: createTask } = useCreateTask();
  const { mutateAsync: updateTask } = useUpdateTask();
  const { mutateAsync: deleteTask } = useDeleteTask();
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
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Task['priority']>('all');
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>('all');
  const tasksByStatus = useMemo<Record<TaskStatus, Task[]>>(() => ({
    todo: tasks.filter((task) => task.status === 'todo'),
    in_progress: tasks.filter((task) => task.status === 'in_progress'),
    done: tasks.filter((task) => task.status === 'done'),
  }), [tasks]);
  const visibleTasksByStatus = useMemo<Record<TaskStatus, Task[]>>(() => {
    const matchesFilters = (task: Task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.trim().toLowerCase()) || task.description?.toLowerCase().includes(search.trim().toLowerCase());
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const dueDate = getDueDateMeta(task.dueDate);
      const matchesDueDate = dueDateFilter === 'all' ||
        (dueDateFilter === 'none' && !dueDate) ||
        (dueDateFilter === 'overdue' && dueDate?.type === 'overdue') ||
        (dueDateFilter === 'today' && dueDate?.type === 'today') ||
        (dueDateFilter === 'upcoming' && dueDate?.type === 'upcoming');
      return matchesSearch && matchesPriority && matchesDueDate;
    };

    return {
      todo: tasksByStatus.todo.filter(matchesFilters),
      in_progress: tasksByStatus.in_progress.filter(matchesFilters),
      done: tasksByStatus.done.filter(matchesFilters),
    };
  }, [dueDateFilter, priorityFilter, search, tasksByStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      await createTask({
        title: newTask.title.trim(),
        description: newTask.description.trim() || null,
        priority: newTask.priority,
        dueDate: newTask.dueDate || null,
        status: 'todo',
      });
      
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
      setIsAdding(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditState({ 
      id: task.id, 
      title: task.title, 
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate || ''
    });
  };

  const handleSaveEdit = async () => {
    if (editState.id && editState.title.trim()) {
      await updateTask({
        id: editState.id,
        title: editState.title.trim(),
        description: editState.description.trim() || null,
        priority: editState.priority,
        dueDate: editState.dueDate || null,
      });
      setEditState({ id: null, title: '', description: '', priority: 'medium', dueDate: '' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };

  // Drag and drop functions
  const handleDragStart = (task: Task, status: TaskStatus) => {
    setDraggedTask({ task, status });
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      await updateTask({ id: draggedTask.task.id, status: newStatus });
    }
    setDraggedTask(null);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasksByStatus.done.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <AnimatedWidget className="w-full bg-gradient-to-br from-purple-50 to-indigo-100 lg:h-[680px]">
      <div className="flex h-full min-h-0 flex-col">
        {/* Header */}
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

        {/* Task creation form */}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks..."
            className="sm:col-span-1 w-full p-2 border border-gray-300 rounded text-sm"
          />
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as 'all' | Task['priority'])} className="p-2 border border-gray-300 rounded text-sm">
            <option value="all">All priorities</option>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
          <select value={dueDateFilter} onChange={(event) => setDueDateFilter(event.target.value as DueDateFilter)} className="p-2 border border-gray-300 rounded text-sm">
            <option value="all">All deadlines</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due today</option>
            <option value="upcoming">Upcoming</option>
            <option value="none">No deadline</option>
          </select>
        </div>

        {/* Responsive column grid */}
        <div className="min-h-0 flex-1">
          {isLoading && <p className="text-sm text-gray-500">Loading tasks…</p>}

          {/* Desktop: 3 columns */}
          <div className="hidden h-full min-h-0 grid-cols-3 gap-4 lg:grid">
            {(Object.entries(visibleTasksByStatus) as [TaskStatus, Task[]][]).map(([status, statusTasks]) => (
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

          {/* Tablet: 2 columns */}
          <div className="hidden h-full min-h-0 grid-cols-2 gap-4 md:grid lg:hidden">
            {(Object.entries(visibleTasksByStatus).slice(0, 2) as [TaskStatus, Task[]][]).map(([status, statusTasks]) => (
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

          {/* Mobile: horizontal scrolling */}
          <div className="md:hidden flex overflow-x-auto pb-4 space-x-4 h-full">
            <div className="flex space-x-4 min-w-max">
              {(Object.entries(visibleTasksByStatus) as [TaskStatus, Task[]][]).map(([status, statusTasks]) => (
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
