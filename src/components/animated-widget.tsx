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
      className={`ff-card ff-widget-surface
        p-4 transition-shadow duration-200
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
