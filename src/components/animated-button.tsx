// src/components/animated-button.tsx
'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function AnimatedButton({ 
  children, 
  onClick, 
  disabled = false, 
  className = '' 
}: AnimatedButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
      className={`bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-400 ${className}`}
    >
      {children}
    </motion.button>
  );
}
