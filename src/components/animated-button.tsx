// src/components/animated-button.tsx
'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function AnimatedButton({ 
  children, 
  onClick, 
  disabled = false,
  className = '',
  ariaLabel,
  type = 'button',
}: AnimatedButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
      className={`rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-300 ${className}`}
    >
      {children}
    </motion.button>
  );
}
