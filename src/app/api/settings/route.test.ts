import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getCurrentUserId: vi.fn(),
  findUnique: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({ getCurrentUserId: mocks.getCurrentUserId }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    userSettings: {
      findUnique: mocks.findUnique,
      upsert: mocks.upsert,
    },
  },
}));

import { GET, PUT } from './route';

describe('/api/settings ownership', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reads settings only for the authenticated user', async () => {
    mocks.getCurrentUserId.mockResolvedValue('user-a');
    mocks.findUnique.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mocks.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-a' } });
  });

  it('writes settings only for the authenticated user', async () => {
    mocks.getCurrentUserId.mockResolvedValue('user-a');
    mocks.upsert.mockResolvedValue({ userId: 'user-a', dailyFocusGoal: 120 });

    const response = await PUT(new Request('http://localhost/api/settings', {
      method: 'PUT',
      body: JSON.stringify({ dailyFocusGoal: 120, userId: 'user-b' }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect(response.status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-a' },
      create: {
        userId: 'user-a',
        dailyFocusGoal: 120,
        dailyPomodoroGoal: 4,
        notificationsEnabled: false,
      },
      update: { dailyFocusGoal: 120 },
    });
  });
});
