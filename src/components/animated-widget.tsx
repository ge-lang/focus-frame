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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
      }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white p-6 rounded-lg shadow-md border transition-colors ${className}`}
    >
      {children}
    </motion.div>
  );
}