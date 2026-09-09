// src/components/widgets/task-widget.tsx
'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { AnimatedWidget } from '@/components/animated-widget';
import { AnimatedButton } from '@/components/animated-button';
import {
  Plus, 
  Trash2, 
  Edit, 
  Calendar,
  Flag,
  GripVertical,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskStatus } from '@/types/task';
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from '@/hooks/use-tasks';
import { filterTasks, getDueDateMeta, toDateInputValue, type DueDateFilter } from '@/lib/task-utils';
import { EmptyState } from '@/components/empty-state';

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

interface PointerTaskDrag {
  task: Task;
  sourceStatus: TaskStatus;
  currentStatus: TaskStatus;
  pointerId: number;
  startX: number;
  startY: number;
  active: boolean;
  timer: number | null;
  cleanup?: () => void;
}

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

// Task card component
function TaskCard({ 
  task, 
  status, 
  onEdit, 
  onDelete, 
  onPointerDragStart,
  editState,
  onSaveEdit,
  onCancelEdit 
}: { 
  task: Task;
  status: TaskStatus;
  onEdit: (task: Task, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onPointerDragStart: (task: Task, status: TaskStatus, event: ReactPointerEvent<HTMLButtonElement>) => void;
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
      className="group relative rounded-lg border border-slate-200 bg-white p-2.5"
    >
      {/* Drag handle */}
      <button
        type="button"
        data-no-drag
        aria-label={`Move task: ${task.title}`}
        onPointerDown={(event) => onPointerDragStart(task, status, event)}
        className="ff-task-drag-handle absolute left-2 top-2 rounded p-1 text-gray-400 opacity-0 transition-opacity hover:text-indigo-400 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 group-hover:opacity-100"
      >
        <GripVertical size={12} className="text-gray-400" />
      </button>

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
              className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700"
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
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
                aria-label={`Edit task: ${task.title}`}
                onClick={() => onEdit(task, status)}
                className="p-1 text-blue-600 hover:text-blue-800"
                title="Edit"
              >
                <Edit size={12} />
              </button>
              <button
                aria-label={`Delete task: ${task.title}`}
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
              getPriorityColor(task.priority) === 'red' ? 'bg-red-50 text-red-700' :
              getPriorityColor(task.priority) === 'yellow' ? 'bg-amber-50 text-amber-700' :
              'bg-emerald-50 text-emerald-700'
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
            <p className="mt-2 text-xs text-indigo-600">⏱ {formatFocusTime(task.focusSeconds)}</p>
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
  onPointerDragStart,
  isDropTarget,
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
  onPointerDragStart: (task: Task, status: TaskStatus, event: ReactPointerEvent<HTMLButtonElement>) => void;
  isDropTarget: boolean;
  editState: EditState;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  return (
    <div
      data-task-drop-status={status}
      className={`ff-task-column flex h-full min-h-0 flex-col rounded-lg transition-shadow ${isDropTarget ? 'ring-2 ring-indigo-400/70' : ''}`}
      onDragOver={(e) => onDragOver(e, status)}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className={`rounded-t-lg p-2.5 text-center font-medium ${
        status === 'todo' ? 'bg-slate-100 text-slate-700' :
        status === 'in_progress' ? 'bg-indigo-50 text-indigo-700' :
        'bg-emerald-50 text-emerald-700'
      }`}>
        <div className="font-semibold text-sm">{getStatusLabel(status)}</div>
        <div className="text-xs opacity-75">{tasks.length} tasks</div>
      </div>
      
      <div className={`ff-task-items min-h-0 flex-1 space-y-3 overflow-y-auto rounded-b-lg bg-slate-50/70 p-2.5 ${
        'bg-slate-50'
      } rounded-b-lg`}>
        <AnimatePresence>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              status={status}
              onEdit={onEdit}
              onDelete={onDelete}
              onPointerDragStart={onPointerDragStart}
              editState={editState}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
            />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <EmptyState icon={ClipboardList} title="No tasks in this column" />
        )}
      </div>
    </div>
  );
}

// Main component
export default function TaskWidget({ widgetId, title }: TaskWidgetProps) {
  const { data: tasks = [], isLoading } = useTasks();
  const { mutateAsync: createTask, isPending: isCreating } = useCreateTask();
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
  const pointerDragRef = useRef<PointerTaskDrag | null>(null);
  const taskScrollRef = useRef<{ active: boolean; pointerY: number; frame: number | null }>({ active: false, pointerY: 0, frame: null });
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dropStatus, setDropStatus] = useState<TaskStatus | null>(null);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Task['priority']>('all');
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tasksByStatus = useMemo<Record<TaskStatus, Task[]>>(() => ({
    todo: tasks.filter((task) => task.status === 'todo'),
    in_progress: tasks.filter((task) => task.status === 'in_progress'),
    done: tasks.filter((task) => task.status === 'done'),
  }), [tasks]);
  const visibleTasksByStatus = useMemo<Record<TaskStatus, Task[]>>(() => {
    return {
      todo: filterTasks(tasksByStatus.todo, search, priorityFilter, dueDateFilter),
      in_progress: filterTasks(tasksByStatus.in_progress, search, priorityFilter, dueDateFilter),
      done: filterTasks(tasksByStatus.done, search, priorityFilter, dueDateFilter),
    };
  }, [dueDateFilter, priorityFilter, search, tasksByStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !newTask.title.trim()) return;

    setIsSubmitting(true);
    try {
      await createTask({
        title: newTask.title.trim(),
        description: newTask.description.trim() || null,
        priority: newTask.priority,
        dueDate: newTask.dueDate || null,
        status: 'todo',
      });
      
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
      setIsAdding(false);
      setSearch('');
      setPriorityFilter('all');
      setDueDateFilter('all');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditState({ 
      id: task.id, 
      title: task.title, 
      description: task.description || '',
      priority: task.priority,
      dueDate: toDateInputValue(task.dueDate)
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

  const stopTaskAutoScroll = () => {
    const scroll = taskScrollRef.current;
    scroll.active = false;
    if (scroll.frame !== null) {
      window.cancelAnimationFrame(scroll.frame);
      scroll.frame = null;
    }
  };

  const startTaskAutoScroll = () => {
    const scroll = taskScrollRef.current;
    if (scroll.active) return;
    scroll.active = true;
    const tick = () => {
      if (!scroll.active) return;
      const edge = 84;
      const distanceFromTop = scroll.pointerY;
      const distanceFromBottom = window.innerHeight - scroll.pointerY;
      const delta = distanceFromTop < edge
        ? -4 * (1 - distanceFromTop / edge)
        : distanceFromBottom < edge ? 4 * (1 - distanceFromBottom / edge) : 0;
      if (delta) window.scrollBy(0, delta);
      scroll.frame = window.requestAnimationFrame(tick);
    };
    scroll.frame = window.requestAnimationFrame(tick);
  };

  const clearPointerTaskDrag = () => {
    const drag = pointerDragRef.current;
    if (drag?.timer !== null && drag?.timer !== undefined) window.clearTimeout(drag.timer);
    drag?.cleanup?.();
    pointerDragRef.current = null;
    setDraggingTaskId(null);
    setDropStatus(null);
    stopTaskAutoScroll();
  };

  const finishPointerTaskDrag = async () => {
    const drag = pointerDragRef.current;
    if (!drag) return;
    const destination = drag.currentStatus;
    const shouldMove = drag.active && destination !== drag.sourceStatus;
    clearPointerTaskDrag();
    if (shouldMove) await updateTask({ id: drag.task.id, status: destination });
  };

  const handlePointerDragStart = (task: Task, status: TaskStatus, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (pointerDragRef.current) return;
    event.preventDefault();
    event.stopPropagation();

    const drag: PointerTaskDrag = {
      task,
      sourceStatus: status,
      currentStatus: status,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      active: event.pointerType !== 'touch',
      timer: null,
    };
    const activate = () => {
      if (pointerDragRef.current !== drag) return;
      drag.active = true;
      setDraggingTaskId(task.id);
      setDropStatus(status);
      taskScrollRef.current.pointerY = event.clientY;
      startTaskAutoScroll();
    };
    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== drag.pointerId || pointerDragRef.current !== drag) return;
      const distance = Math.hypot(moveEvent.clientX - drag.startX, moveEvent.clientY - drag.startY);
      if (!drag.active) {
        if (distance > 10) clearPointerTaskDrag();
        return;
      }
      moveEvent.preventDefault();
      taskScrollRef.current.pointerY = moveEvent.clientY;
      const dropTarget = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest<HTMLElement>('[data-task-drop-status]');
      const nextStatus = dropTarget?.dataset.taskDropStatus as TaskStatus | undefined;
      if (nextStatus) {
        drag.currentStatus = nextStatus;
        setDropStatus(nextStatus);
      }
    };
    const onEnd = () => { void finishPointerTaskDrag(); };
    drag.cleanup = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
    };
    pointerDragRef.current = drag;
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onEnd, { once: true });
    window.addEventListener('pointercancel', onEnd, { once: true });
    if (event.pointerType === 'touch') drag.timer = window.setTimeout(activate, 220);
    else activate();
  };

  useEffect(() => () => {
    const drag = pointerDragRef.current;
    if (drag?.timer !== null && drag?.timer !== undefined) window.clearTimeout(drag.timer);
    drag?.cleanup?.();
    const scroll = taskScrollRef.current;
    scroll.active = false;
    if (scroll.frame !== null) window.cancelAnimationFrame(scroll.frame);
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasksByStatus.done.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <AnimatedWidget className="ff-card-solid w-full min-h-0">
      <div className="flex h-full min-h-0 flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <div>
            <h3 className="widget-drag-handle cursor-grab select-none font-semibold text-lg text-gray-800 active:cursor-grabbing">
              {title || 'Tasks'}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className="text-xs text-gray-600">
                {completedTasks}/{totalTasks} completed
              </div>
              <div className="w-16 bg-gray-200 rounded-full h-1">
                <div 
                  className="h-1 rounded-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
          
          <AnimatedButton
            onClick={() => setIsAdding(true)}
            className="ff-btn-primary h-9 w-full sm:w-auto"
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
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto overscroll-contain bg-slate-950/70 p-4 pt-[max(4rem,10vh)]"
              onClick={() => setIsAdding(false)}
            >
              <form onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()} className="w-full max-w-md max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                <label className="sr-only" htmlFor="new-task-title">Task title</label>
                <input
                  id="new-task-title"
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  autoFocus
                />
                <label className="sr-only" htmlFor="new-task-description">Task description</label>
                <textarea
                  id="new-task-description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Description (optional)"
                  className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-2">
                  <label className="sr-only" htmlFor="new-task-priority">Task priority</label>
                  <select
                    id="new-task-priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                    className="p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <label className="sr-only" htmlFor="new-task-due-date">Task due date</label>
                  <input
                    id="new-task-due-date"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || isCreating}
                    className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm text-white hover:bg-indigo-700"
                  >
                    Add Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="sr-only" htmlFor="task-search">Search tasks</label>
          <input
            id="task-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks..."
            className="h-9 w-full rounded-lg border border-slate-200 p-2 text-sm sm:col-span-2"
          />
          <select aria-label="Filter tasks by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as 'all' | Task['priority'])} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm">
            <option value="all">All priorities</option>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
          <select aria-label="Filter tasks by due date" value={dueDateFilter} onChange={(event) => setDueDateFilter(event.target.value as DueDateFilter)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm">
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
                onDragOver={() => undefined}
                onDrop={() => undefined}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPointerDragStart={handlePointerDragStart}
                isDropTarget={dropStatus === status && draggingTaskId !== null}
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
                onDragOver={() => undefined}
                onDrop={() => undefined}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPointerDragStart={handlePointerDragStart}
                isDropTarget={dropStatus === status && draggingTaskId !== null}
                editState={editState}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => setEditState({ id: null, title: '', description: '', priority: 'medium', dueDate: '' })}
              />
            ))}
          </div>

          {/* Mobile: stacked drop zones with natural document height */}
          <div className="ff-mobile-task-columns md:hidden flex flex-col gap-4">
              {(Object.entries(visibleTasksByStatus) as [TaskStatus, Task[]][]).map(([status, statusTasks]) => (
                <div key={status} className="w-full min-w-0">
                  <TaskColumn
                    status={status as TaskStatus}
                    tasks={statusTasks}
                onDragOver={() => undefined}
                onDrop={() => undefined}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                onPointerDragStart={handlePointerDragStart}
                isDropTarget={dropStatus === status && draggingTaskId !== null}
                    editState={editState}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={() => setEditState({ id: null, title: '', description: '', priority: 'medium', dueDate: '' })}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </AnimatedWidget>
  );
}
