// src/components/widgets/todo-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoWidget() {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Complete dashboard design', completed: false },
    { id: '2', text: 'Add weather API', completed: true },
    { id: '3', text: 'Test responsive layout', completed: false },
  ]);

  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now().toString(),
        text: newTodo,
        completed: false
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <AnimatedWidget className="bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="h-full flex flex-col">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">Tasks</h3>
        
        <div className="flex-1 space-y-2 mb-3">
          {todos.map((todo) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center group"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span
                className={`ml-3 text-sm ${
                  todo.completed
                    ? 'line-through text-gray-500'
                    : 'text-gray-700'
                } group-hover:text-purple-700 transition-colors`}
              >
                {todo.text}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add new task..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={addTodo}
            className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </AnimatedWidget>
  );
}