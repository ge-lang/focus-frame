'use client';
import { useState } from 'react';
import { AnimatedWidget } from '@/components/animated-widget';
import { EmptyState } from '@/components/empty-state';
import { Plus, Target, X } from 'lucide-react';
import { Priority, useCreateGoal, useDeleteGoal, useGoals, useUpdateGoal } from '@/hooks/use-personal-widgets';

interface GoalsWidgetProps {
  widgetId: string;
  title?: string;
}

const priorityClassMap: Record<Priority, string> = {
  low: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-amber-50 text-amber-700',
};

export default function GoalsWidget({ title }: GoalsWidgetProps) {
  const { data: goals = [], isLoading } = useGoals();
  const { mutate: createGoal } = useCreateGoal();
  const { mutate: updateGoal } = useUpdateGoal();
  const { mutate: deleteGoal } = useDeleteGoal();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', priority: 'medium' as Priority });

  const addGoal = () => {
    if (!newGoal.title.trim()) return;
    createGoal({ title: newGoal.title.trim(), priority: newGoal.priority });
    setNewGoal({ title: '', priority: 'medium' });
    setIsAdding(false);
  };

  const completedGoals = goals.filter((goal) => goal.completed).length;
  const completionPercentage = goals.length ? Math.round((completedGoals / goals.length) * 100) : 0;

  return (
    <AnimatedWidget>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg text-gray-800">{title || 'Goals'}</h3>
          <button aria-label={isAdding ? 'Close add goal form' : 'Add goal'} onClick={() => setIsAdding(!isAdding)} className="rounded-lg p-1.5 text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-800" title="Add goal">{isAdding ? <X size={16} /> : <Plus size={16} />}</button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium text-indigo-600">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${completionPercentage}%` }} /></div>
        </div>

        {isAdding && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <label className="sr-only" htmlFor="new-goal-title">Goal title</label>
            <input id="new-goal-title" type="text" placeholder="What do you want to achieve?" value={newGoal.title} onChange={(event) => setNewGoal({ ...newGoal, title: event.target.value })} className="w-full mb-2 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <label className="sr-only" htmlFor="new-goal-priority">Goal priority</label>
            <select id="new-goal-priority" value={newGoal.priority} onChange={(event) => setNewGoal({ ...newGoal, priority: event.target.value as Priority })} className="w-full mb-2 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="low">Low Priority</option><option value="medium">Medium Priority</option><option value="high">High Priority</option>
            </select>
            <div className="flex space-x-2">
              <button onClick={addGoal} className="flex-1 rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700">Add Goal</button>
              <button onClick={() => setIsAdding(false)} className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading && <p className="text-sm text-gray-500">Loading goals…</p>}
          {goals.map((goal) => (
            <div key={goal.id} className="group relative rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50">
              <div className="flex items-center">
                <input type="checkbox" checked={goal.completed} onChange={() => updateGoal({ id: goal.id, completed: !goal.completed })} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                <span className={`ml-3 flex-1 ${goal.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{goal.title}</span>
                <span className={`ml-2 rounded-full px-2 py-1 text-xs ${priorityClassMap[goal.priority]}`}>{goal.priority}</span>
                <button aria-label={`Remove goal: ${goal.title}`} onClick={() => deleteGoal(goal.id)} className="ml-2 rounded p-1 text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-700" title="Remove goal"><X size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && goals.length === 0 && !isAdding && (
          <EmptyState
            icon={Target}
            title="No goals yet"
            action={<button onClick={() => setIsAdding(true)} className="text-sm font-medium text-indigo-700 hover:text-indigo-900">Add goal</button>}
          />
        )}
      </div>
    </AnimatedWidget>
  );
}
