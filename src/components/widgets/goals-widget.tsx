// src/components/widgets/goals-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';
import { useState } from 'react';

type Priority = 'low' | 'medium' | 'high';

interface Goal {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: Priority;
}

interface GoalsWidgetProps {
  widgetId: string;
  title?: string;
}

const initialGoals: Goal[] = [
  { id: '1', title: 'Learn React Native', completed: false, priority: 'high' },
  { id: '2', title: 'Finish project documentation', completed: true, priority: 'medium' },
  { id: '3', title: 'Exercise 3 times this week', completed: false, priority: 'medium' },
];

const priorityClassMap: Record<Priority, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export default function GoalsWidget({ widgetId, title }: GoalsWidgetProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', priority: 'medium' as Priority });

  const addGoal = () => {
    if (newGoal.title.trim()) {
      setGoals([
        ...goals,
        {
          id: Date.now().toString(),
          title: newGoal.title,
          completed: false,
          priority: newGoal.priority,
        },
      ]);
      setNewGoal({ title: '', priority: 'medium' });
      setIsAdding(false);
    }
  };

  const toggleGoal = (id: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const completedGoals = goals.filter((goal) => goal.completed).length;
  const totalGoals = goals.length;
  const completionPercentage =
    totalGoals > 0
      ? Math.round((completedGoals / totalGoals) * 100)
      : 0;

  return (
    <AnimatedWidget className="bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg text-gray-800">
            {title || 'Goals'}
          </h3>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
            title="Add goal"
          >
            ➕
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium text-indigo-600">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {isAdding && (
          <div className="mb-4 p-3 bg-white/50 rounded-lg">
            <input
              type="text"
              placeholder="What do you want to achieve?"
              value={newGoal.title}
              onChange={(e) =>
                setNewGoal({ ...newGoal, title: e.target.value })
              }
              className="w-full mb-2 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={newGoal.priority}
              onChange={(e) =>
                setNewGoal({
                  ...newGoal,
                  priority: e.target.value as Priority,
                })
              }
              className="w-full mb-2 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <div className="flex space-x-2">
              <button
                onClick={addGoal}
                className="flex-1 px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 transition-colors"
              >
                Add Goal
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="group relative p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => toggleGoal(goal.id)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span
                  className={`ml-3 flex-1 ${
                    goal.completed
                      ? 'line-through text-gray-500'
                      : 'text-gray-800'
                  }`}
                >
                  {goal.title}
                </span>
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full ${priorityClassMap[goal.priority]}`}
                >
                  {goal.priority}
                </span>
                <button
                  onClick={() => removeGoal(goal.id)}
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700"
                  title="Remove goal"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {goals.length === 0 && !isAdding && (
          <div className="text-center text-gray-500 py-4">
            No goals set. Click + to add your first goal!
          </div>
        )}
      </div>
    </AnimatedWidget>
  );
}
