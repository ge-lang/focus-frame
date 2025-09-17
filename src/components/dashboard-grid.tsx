// src/components/dashboard-grid.tsx
'use client';
import { motion } from 'framer-motion';
import { useDashboard } from '@/contexts/dashboard-context';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function DashboardGrid() {
  const { state } = useDashboard();
  const { layout } = state;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {layout.map((item) => (
        <motion.div
          key={item.i}
          variants={itemVariants}
          className={item.w > 1 ? 'lg:col-span-2' : ''}
        >
          {<DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={layout.map(item => item.i)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {layout.map((item) => (
            <div key={item.i} className={item.w > 1 ? 'lg:col-span-2' : ''}>
              <SortableWidget id={item.i} type={item.i.split('-')[0]} />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>}
        </motion.div>
      ))}
    </motion.div>
  );
}

// src/components/dashboard-grid.tsx
