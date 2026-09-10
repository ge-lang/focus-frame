'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Responsive, type Layout as GridLayout, type LayoutItem as GridLayoutItem } from 'react-grid-layout';
import { noCompactor } from 'react-grid-layout/core';
import 'react-grid-layout/css/styles.css';
import { useDashboard } from '@/contexts/dashboard-context';
import { useStableContainerWidth } from '@/hooks/use-stable-container-width';
import { SortableWidget } from './sortable-widget';
import { applyLayoutHeightOverrides, canPersistDesktopLayout, getGridHeightForContent, getWidgetSizing, normalizeDesktopOrigin, normalizeLayout, reconcileLayoutTypes, stackLayoutForMobile } from '@/lib/dashboard-layout';
import type { LayoutItem } from '@/types/dashboard';

const BREAKPOINTS = { lg: 1024, md: 768, sm: 640, xs: 480, xxs: 0 } as const;
const COLUMNS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } as const;
const fixedGridCompactor = { ...noCompactor, preventCollision: true };
type AutoScrollState = { active: boolean; pointerY: number; frame: number | null; cleanup?: () => void };

export function DashboardGrid() {
  const { state, isHydrated, updateLayout } = useDashboard();
  const { layout, isEditing, widgets } = state;
  const [heightOverrides, setHeightOverrides] = useState<Record<string, number>>({});
  const { width, containerRef, isStable } = useStableContainerWidth();
  const breakpointRef = useRef('lg');
  const autoScrollRef = useRef<AutoScrollState>({
    active: false,
    pointerY: 0,
    frame: null,
  });
  const isDraggingRef = useRef(false);

  useEffect(() => {
    setHeightOverrides((current) => {
      const validIds = new Set(layout.map((item) => item.i));
      const next = Object.fromEntries(Object.entries(current).filter(([id]) => validIds.has(id)));
      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
  }, [layout]);

  const stopAutoScroll = useCallback(() => {
    const state = autoScrollRef.current;
    state.active = false;
    state.cleanup?.();
    state.cleanup = undefined;
    if (state.frame !== null) {
      window.cancelAnimationFrame(state.frame);
      state.frame = null;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    autoScrollRef.current.active = true;

    const handlePointerMove = (event: PointerEvent) => {
      autoScrollRef.current.pointerY = event.clientY;
    };
    const scrollFrame = () => {
      const state = autoScrollRef.current;
      if (!state.active) return;

      const edgeThreshold = 80;
      const maximumSpeed = 5;
      const distanceFromTop = state.pointerY;
      const distanceFromBottom = window.innerHeight - state.pointerY;
      let scrollDelta = 0;

      if (distanceFromTop >= 0 && distanceFromTop < edgeThreshold) {
        scrollDelta = -maximumSpeed * (1 - distanceFromTop / edgeThreshold);
      } else if (distanceFromBottom >= 0 && distanceFromBottom < edgeThreshold) {
        scrollDelta = maximumSpeed * (1 - distanceFromBottom / edgeThreshold);
      }

      if (scrollDelta !== 0) window.scrollBy(0, scrollDelta);
      state.frame = window.requestAnimationFrame(scrollFrame);
    };

    window.addEventListener('pointermove', handlePointerMove);
    autoScrollRef.current.frame = window.requestAnimationFrame(scrollFrame);

    const cleanup = () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
    autoScrollRef.current.cleanup = cleanup;
  }, [stopAutoScroll]);

  useEffect(() => () => {
    stopAutoScroll();
  }, [stopAutoScroll]);

  const renderDesktopLayout = useMemo(() => applyLayoutHeightOverrides(layout, heightOverrides), [layout, heightOverrides]);

  const layouts = useMemo(() => ({
    lg: renderDesktopLayout,
    md: stackLayoutForMobile(layout, COLUMNS.md),
    sm: stackLayoutForMobile(layout, COLUMNS.sm),
    xs: stackLayoutForMobile(layout, COLUMNS.xs),
    xxs: stackLayoutForMobile(layout, COLUMNS.xxs),
  }), [renderDesktopLayout, layout]);

  const getWidgetById = (id: string) => widgets.find((widget) => widget.id === id);

  const renderWidget = (item: LayoutItem) => {
    const widget = getWidgetById(item.i);
    return widget ? (
      <div key={item.i}>
        <SortableWidget id={item.i} type={item.type} onContentHeightChange={handleWidgetContentHeight} />
      </div>
    ) : null;
  };

  function handleWidgetContentHeight(widgetId: string, contentHeight: number) {
    if (!isStable || width < BREAKPOINTS.sm || breakpointRef.current !== 'lg') return;

    const currentItem = renderDesktopLayout.find((item) => item.i === widgetId);
    if (!currentItem) return;

    const minimumHeight = getWidgetSizing(currentItem.type).h;
    const requiredHeight = getGridHeightForContent(contentHeight, 72, 16, minimumHeight);
    if (requiredHeight === currentItem.h) return;

    setHeightOverrides((current) => {
      if (requiredHeight === minimumHeight) {
        if (current[widgetId] === undefined) return current;
        const next = { ...current };
        delete next[widgetId];
        return next;
      }
      if (current[widgetId] === requiredHeight) return current;
      return { ...current, [widgetId]: requiredHeight };
    });
  }

  const handleUserLayoutChange = (nextLayout: GridLayout) => {
    if (!isStable || !canPersistDesktopLayout(isHydrated, width, breakpointRef.current, BREAKPOINTS.lg) || isDraggingRef.current) return;

    const callbackLayout: LayoutItem[] = nextLayout.flatMap((item: GridLayoutItem) => {
      const widget = widgets.find((candidate) => candidate.id === item.i);
      return widget ? [{ ...item, type: widget.type }] : [];
    });
    const reconciledLayout = reconcileLayoutTypes(callbackLayout, widgets);
    const persistedLayout = reconciledLayout.map((item) => ({
      ...item,
      w: getWidgetSizing(item.type).w,
      h: getWidgetSizing(item.type).h,
    }));
    const normalized = normalizeDesktopOrigin(normalizeLayout(persistedLayout));
    updateLayout(normalized, { markDirty: true });
  };

  return (
    <div ref={containerRef} className="w-full min-w-0">
      {!isHydrated || !isStable ? (
        <div className="min-h-24" aria-hidden="true" />
      ) : width < BREAKPOINTS.sm ? (
        <div className="ff-mobile-widget-stack">
          {layout.map(renderWidget)}
        </div>
      ) : (
        <Responsive
          width={width}
          layouts={layouts}
          breakpoints={BREAKPOINTS}
          cols={COLUMNS}
          rowHeight={72}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          compactor={fixedGridCompactor}
          dragConfig={{
            enabled: true,
            handle: '.widget-drag-handle',
            cancel: 'button, input, textarea, select, a, [draggable], [data-no-drag]',
          }}
          resizeConfig={{ enabled: false }}
          onDragStart={() => { isDraggingRef.current = true; startAutoScroll(); }}
          onDragStop={(nextLayout) => {
            isDraggingRef.current = false;
            stopAutoScroll();
            handleUserLayoutChange(nextLayout);
          }}
          onBreakpointChange={(nextBreakpoint) => {
            breakpointRef.current = nextBreakpoint;
          }}
        >
          {layout.map(renderWidget)}
        </Responsive>
      )}
    </div>
  );
}
