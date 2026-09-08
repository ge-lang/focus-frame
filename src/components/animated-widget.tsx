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
      className={`ff-card
        rounded-2xl border border-slate-200 bg-white p-4 shadow-sm
        transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
