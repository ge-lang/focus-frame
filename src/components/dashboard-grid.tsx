'use client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Responsive, useContainerWidth, type Layout as GridLayout, type LayoutItem as GridLayoutItem } from 'react-grid-layout';
import { noCompactor } from 'react-grid-layout/core';
import 'react-grid-layout/css/styles.css';
import { useDashboard } from '@/contexts/dashboard-context';
import { SortableWidget } from './sortable-widget';
import type { LayoutItem } from '@/types/dashboard';

const BREAKPOINTS = { lg: 1024, md: 768, sm: 640, xs: 480, xxs: 0 } as const;
const COLUMNS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } as const;
const fixedGridCompactor = { ...noCompactor, preventCollision: true };
type AutoScrollState = { active: boolean; pointerY: number; frame: number | null; cleanup?: () => void };

function stackLayout(layout: LayoutItem[], columns: number): LayoutItem[] {
  let y = 0;
  return layout.map((item) => {
    const stacked = { ...item, x: 0, y, w: columns };
    y += item.h;
    return stacked;
  });
}

export function DashboardGrid() {
  const { state, updateLayout } = useDashboard();
  const { layout, isEditing, widgets } = state;
  const { width, containerRef, mounted } = useContainerWidth({ measureBeforeMount: true });
  const breakpointRef = useRef('lg');
  const autoScrollRef = useRef<AutoScrollState>({
    active: false,
    pointerY: 0,
    frame: null,
  });

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

      const edgeThreshold = 96;
      const maximumSpeed = 8;
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

    const updatePointerPosition = (event: MouseEvent) => {
      autoScrollRef.current.pointerY = event.clientY;
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('mousemove', updatePointerPosition);
    autoScrollRef.current.frame = window.requestAnimationFrame(scrollFrame);

    const cleanup = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', updatePointerPosition);
    };
    autoScrollRef.current.cleanup = cleanup;
  }, [stopAutoScroll]);

  useEffect(() => () => {
    stopAutoScroll();
  }, [stopAutoScroll]);

  const layouts = useMemo(() => ({
    lg: layout,
    md: stackLayout(layout, COLUMNS.md),
    sm: stackLayout(layout, COLUMNS.sm),
    xs: stackLayout(layout, COLUMNS.xs),
    xxs: stackLayout(layout, COLUMNS.xxs),
  }), [layout]);

  const getWidgetById = (id: string) => widgets.find((widget) => widget.id === id);

  const handleLayoutChange = (nextLayout: GridLayout) => {
    if (breakpointRef.current !== 'lg') return;

    const types = new Map(layout.map((item) => [item.i, item.type]));
    const persistedLayout: LayoutItem[] = nextLayout.map((item: GridLayoutItem) => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      type: types.get(item.i) ?? 'notes',
    }));
    updateLayout(persistedLayout);
  };

  return (
    <div ref={containerRef} className="min-w-0">
      {mounted && (
        <Responsive
          width={width}
          layouts={layouts}
          breakpoints={BREAKPOINTS}
          cols={COLUMNS}
          rowHeight={96}
          margin={[20, 20]}
          containerPadding={[0, 0]}
          compactor={fixedGridCompactor}
          dragConfig={{
            enabled: true,
            handle: '.widget-drag-handle',
            cancel: 'button, input, textarea, select, a, [draggable], [data-no-drag]',
          }}
          resizeConfig={{ enabled: false }}
          onDragStart={startAutoScroll}
          onDragStop={stopAutoScroll}
          onBreakpointChange={(nextBreakpoint) => { breakpointRef.current = nextBreakpoint; }}
          onLayoutChange={handleLayoutChange}
        >
          {layout.map((item) => {
            const widget = getWidgetById(item.i);
            return widget ? (
              <div key={item.i}>
                <SortableWidget id={item.i} type={item.type} />
              </div>
            ) : null;
          })}
        </Responsive>
      )}
    </div>
  );
}
