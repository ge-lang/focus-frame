import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getCurrentUserId: vi.fn(),
  findMany: vi.fn(),
  taskCount: vi.fn(),
  goalCount: vi.fn(),
  settings: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({ getCurrentUserId: mocks.getCurrentUserId }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    focusSession: { findMany: mocks.findMany },
    task: { count: mocks.taskCount },
    goal: { count: mocks.goalCount },
    userSettings: { findUnique: mocks.settings },
  },
}));

import { GET } from './route';

describe('/api/analytics focus-session contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUserId.mockResolvedValue('user-a');
    mocks.taskCount.mockResolvedValue(0);
    mocks.goalCount.mockResolvedValue(0);
    mocks.settings.mockResolvedValue(null);
  });

  it('includes one persisted work session once and excludes break duration', async () => {
    const completedAt = new Date();
    mocks.findMany
      .mockResolvedValueOnce([
        { duration: 1500, type: 'work', completedAt },
        { duration: 300, type: 'break', completedAt },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ completedAt }]);

    const response = await GET(new Request('http://localhost/api/analytics?range=week') as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.focusMinutes).toBe(25);
    expect(data.dailyFocus.at(-1).minutes).toBe(25);
    expect(mocks.findMany).toHaveBeenNthCalledWith(1, expect.objectContaining({
      where: expect.objectContaining({ userId: 'user-a', type: 'work' }),
    }));
  });
});
