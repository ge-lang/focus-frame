'use client';

import { useEffect, useRef, useState } from 'react';

export function isUsableContainerWidth(width: number): boolean {
  return Number.isFinite(width) && width > 0;
}

export function useStableContainerWidth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [isStable, setIsStable] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    let active = true;
    let validationFrame: number | null = null;

    const cancelValidation = () => {
      if (validationFrame !== null) {
        window.cancelAnimationFrame(validationFrame);
        validationFrame = null;
      }
    };

    const validateWidth = (candidate: number) => {
      cancelValidation();
      if (!isUsableContainerWidth(candidate)) {
        setIsStable(false);
        return;
      }

      let stableFrames = 0;
      const confirm = () => {
        if (!active) return;
        stableFrames += 1;
        if (stableFrames >= 2) {
          setWidth((previous) => previous === candidate ? previous : candidate);
          setIsStable(true);
          validationFrame = null;
          return;
        }
        validationFrame = window.requestAnimationFrame(confirm);
      };

      setIsStable(false);
      validationFrame = window.requestAnimationFrame(confirm);
    };

    const measure = () => validateWidth(Math.round(node.getBoundingClientRect().width));
    measure();

    const observer = new ResizeObserver((entries) => {
      if (!active) return;
      const entry = entries[0];
      if (entry) validateWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(node);

    return () => {
      active = false;
      cancelValidation();
      observer.disconnect();
    };
  }, []);

  return { width, isStable, containerRef };
}
