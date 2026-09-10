'use client';

import { useEffect, useState } from 'react';
import { EditToggle } from '@/components/edit-toggle';
import { WidgetPicker } from '@/components/widget-picker';

export function MobileStickyActions() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 96);
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  if (!visible) return null;

  return (
    <div className="ff-mobile-sticky-actions" aria-label="Dashboard actions">
      <WidgetPicker />
      <EditToggle />
    </div>
  );
}
