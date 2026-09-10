'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState, type ReactNode } from 'react';

let activeModalCount = 0;
let previousDocumentStyles: {
  bodyOverflow: string;
  bodyTouchAction: string;
  bodyOverscrollBehavior: string;
  htmlOverflow: string;
  htmlTouchAction: string;
  htmlOverscrollBehavior: string;
} | null = null;

function acquireScrollLock() {
  if (activeModalCount === 0) {
    const html = document.documentElement;
    const body = document.body;
    previousDocumentStyles = {
      bodyOverflow: body.style.overflow,
      bodyTouchAction: body.style.touchAction,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
      htmlOverflow: html.style.overflow,
      htmlTouchAction: html.style.touchAction,
      htmlOverscrollBehavior: html.style.overscrollBehavior,
    };
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    body.style.overscrollBehavior = 'none';
    html.style.overflow = 'hidden';
    html.style.touchAction = 'none';
    html.style.overscrollBehavior = 'none';
  }
  activeModalCount += 1;

  return () => {
    activeModalCount = Math.max(0, activeModalCount - 1);
    if (activeModalCount !== 0 || !previousDocumentStyles) return;

    const html = document.documentElement;
    const body = document.body;
    body.style.overflow = previousDocumentStyles.bodyOverflow;
    body.style.touchAction = previousDocumentStyles.bodyTouchAction;
    body.style.overscrollBehavior = previousDocumentStyles.bodyOverscrollBehavior;
    html.style.overflow = previousDocumentStyles.htmlOverflow;
    html.style.touchAction = previousDocumentStyles.htmlTouchAction;
    html.style.overscrollBehavior = previousDocumentStyles.htmlOverscrollBehavior;
    previousDocumentStyles = null;
  };
}

export function ModalPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return acquireScrollLock();
  }, []);

  return mounted ? createPortal(children, document.body) : null;
}
