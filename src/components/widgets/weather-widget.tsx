// src/components/widgets/weather-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';
import { motion } from 'framer-motion';

export default function WeatherWidget() {
  return (
    <AnimatedWidget>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h3 className="font-semibold text-lg mb-4">Weather</h3>
        <div className="text-4xl mb-2">☀️</div>
        <div className="text-3xl font-bold text-gray-800">24°C</div>
        <div className="text-gray-600 mb-2">Sunny</div>
        <div className="text-sm text-gray-500">Amsterdam</div>
      </motion.div>
    </AnimatedWidget>
  );
}