'use client';

import { useEffect, useRef, useState } from 'react';

export function isUsableContainerWidth(width: number): boolean {
  return Number.isFinite(width) && width > 0;
}

export interface StableWidthSnapshot {
  initialized: boolean;
  width: number;
  candidateWidth: number | null;
  candidateFrames: number;
}

export function advanceStableWidth(
  snapshot: StableWidthSnapshot,
  rawWidth: number,
  tolerance = 1,
): StableWidthSnapshot {
  const nextWidth = Math.round(rawWidth);
  if (!isUsableContainerWidth(nextWidth)) return snapshot;

  if (snapshot.initialized) {
    return Math.abs(nextWidth - snapshot.width) > tolerance
      ? { ...snapshot, width: nextWidth }
      : snapshot;
  }

  if (snapshot.candidateWidth === null || Math.abs(nextWidth - snapshot.candidateWidth) > tolerance) {
    return { ...snapshot, candidateWidth: nextWidth, candidateFrames: 1 };
  }

  const candidateFrames = snapshot.candidateFrames + 1;
  return candidateFrames >= 2
    ? { initialized: true, width: nextWidth, candidateWidth: null, candidateFrames: 0 }
    : { ...snapshot, candidateFrames };
}

export function useStableContainerWidth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [snapshot, setSnapshot] = useState<StableWidthSnapshot>({
    initialized: false,
    width: 0,
    candidateWidth: null,
    candidateFrames: 0,
  });
  const snapshotRef = useRef(snapshot);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    let active = true;
    let initialFrame: number | null = null;

    const cancelInitialFrame = () => {
      if (initialFrame !== null) {
        window.cancelAnimationFrame(initialFrame);
        initialFrame = null;
      }
    };

    const applyMeasurement = (rawWidth: number) => {
      if (!active) return;

      const current = snapshotRef.current;
      const next = advanceStableWidth(current, rawWidth);
      if (next !== current) {
        snapshotRef.current = next;
        setSnapshot(next);
      }

      if (!next.initialized && initialFrame === null) {
        initialFrame = window.requestAnimationFrame(() => {
          initialFrame = null;
          applyMeasurement(node.getBoundingClientRect().width);
        });
      } else if (next.initialized) {
        cancelInitialFrame();
      }
    };

    applyMeasurement(node.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      if (!active) return;
      const entry = entries[0];
      if (entry) applyMeasurement(entry.contentRect.width);
    });
    observer.observe(node);

    return () => {
      active = false;
      cancelInitialFrame();
      observer.disconnect();
    };
  }, []);

  return { width: snapshot.width, isStable: snapshot.initialized, containerRef };
}
