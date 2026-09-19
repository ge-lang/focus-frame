import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => {
  const persisted: Array<Record<string, unknown>> = [];
  let nextId = 1;
  return {
    persisted,
    getCurrentUserId: vi.fn(),
    taskFindFirst: vi.fn(),
    taskCount: vi.fn(),
    goalCount: vi.fn(),
    settings: vi.fn(),
    focusCreate: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const session = { id: `session-${nextId++}`, ...data, completedAt: new Date() };
      persisted.push(session);
      return session;
    }),
    focusFindMany: vi.fn(async ({ where }: { where: Record<string, unknown> }) => persisted.filter((session) => {
      if (session.userId !== where.userId) return false;
      if (where.type && session.type !== where.type) return false;
      const completedAt = where.completedAt as { gte?: Date; lt?: Date } | undefined;
      if (completedAt?.gte && (session.completedAt as Date) < completedAt.gte) return false;
      if (completedAt?.lt && (session.completedAt as Date) >= completedAt.lt) return false;
      return true;
    })),
  };
});

vi.mock('@/lib/api-auth', () => ({ getCurrentUserId: mocks.getCurrentUserId }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: { findFirst: mocks.taskFindFirst, count: mocks.taskCount },
    goal: { count: mocks.goalCount },
    userSettings: { findUnique: mocks.settings },
    focusSession: { create: mocks.focusCreate, findMany: mocks.focusFindMany },
  },
}));

import { GET } from '../analytics/route';
import { POST } from './route';

describe('focus-session persistence to analytics integration contract', () => {
  beforeEach(() => {
    mocks.persisted.length = 0;
    vi.clearAllMocks();
    mocks.getCurrentUserId.mockResolvedValue('user-a');
    mocks.taskFindFirst.mockResolvedValue({ id: 'task-a', userId: 'user-a' });
    mocks.taskCount.mockResolvedValue(0);
    mocks.goalCount.mockResolvedValue(0);
    mocks.settings.mockResolvedValue(null);
  });

  it('persists linked and unlinked focus sessions, counts work exactly once, and excludes breaks', async () => {
    const linkedResponse = await POST(new Request('http://localhost/api/focus-sessions', {
      method: 'POST',
      body: JSON.stringify({ duration: 1500, type: 'work', taskId: 'task-a' }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);
    const breakResponse = await POST(new Request('http://localhost/api/focus-sessions', {
      method: 'POST',
      body: JSON.stringify({ duration: 300, type: 'break' }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);
    const unlinkedResponse = await POST(new Request('http://localhost/api/focus-sessions', {
      method: 'POST',
      body: JSON.stringify({ duration: 1500, type: 'work' }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect([linkedResponse.status, breakResponse.status, unlinkedResponse.status]).toEqual([201, 201, 201]);
    expect(mocks.persisted.map(({ duration, type, taskId }) => ({ duration, type, taskId }))).toEqual([
      { duration: 1500, type: 'work', taskId: 'task-a' },
      { duration: 300, type: 'break', taskId: null },
      { duration: 1500, type: 'work', taskId: null },
    ]);

    const analyticsResponse = await GET(new Request('http://localhost/api/analytics?range=week') as NextRequest);
    const analytics = await analyticsResponse.json();

    expect(analyticsResponse.status).toBe(200);
    expect(analytics.focusMinutes).toBe(50);
    expect(analytics.dailyFocus.at(-1).minutes).toBe(50);
    expect(mocks.focusFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ userId: 'user-a', type: 'work' }),
    }));
  });
});
