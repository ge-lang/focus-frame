'use client';
import { useMemo, useRef } from 'react';
import { Responsive, useContainerWidth, type Layout as GridLayout, type LayoutItem as GridLayoutItem } from 'react-grid-layout';
import { noCompactor } from 'react-grid-layout/core';
import 'react-grid-layout/css/styles.css';
import { useDashboard } from '@/contexts/dashboard-context';
import { SortableWidget } from './sortable-widget';
import type { LayoutItem } from '@/types/dashboard';

const BREAKPOINTS = { lg: 1024, md: 768, sm: 640, xs: 480, xxs: 0 } as const;
const COLUMNS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } as const;
const fixedGridCompactor = { ...noCompactor, preventCollision: true };

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

  const layouts = useMemo(() => ({
    lg: layout,
    md: stackLayout(layout, COLUMNS.md),
    sm: stackLayout(layout, COLUMNS.sm),
    xs: stackLayout(layout, COLUMNS.xs),
    xxs: stackLayout(layout, COLUMNS.xxs),
  }), [layout]);

  const getWidgetById = (id: string) => widgets.find((widget) => widget.id === id);

  const handleLayoutChange = (nextLayout: GridLayout) => {
    if (!isEditing || breakpointRef.current !== 'lg') return;

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
            enabled: isEditing,
            handle: '.widget-drag-handle',
            cancel: 'button:not(.widget-drag-handle), input, textarea, select, a, [data-no-drag]',
          }}
          resizeConfig={{ enabled: false }}
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
