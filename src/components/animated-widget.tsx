// src/components/animated-widget.tsx
'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedWidgetProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedWidget({ children, className = '' }: AnimatedWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`
        rounded-xl p-4 backdrop-blur-sm
        bg-white/80 dark:bg-gray-800/80
        border border-white/20 dark:border-gray-700/30
        shadow-lg shadow-black/5
        hover:shadow-xl hover:shadow-black/10
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}