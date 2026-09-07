import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getCurrentUserId: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({ getCurrentUserId: mocks.getCurrentUserId }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    goal: {
      findFirst: mocks.findFirst,
      update: mocks.update,
      deleteMany: mocks.deleteMany,
    },
  },
}));

import { DELETE, PUT } from './route';

const requestFor = (method: string) => new Request('http://localhost/api/goals/goal-owned-by-b', {
  method,
  body: method === 'PUT' ? JSON.stringify({ completed: true }) : undefined,
  headers: method === 'PUT' ? { 'Content-Type': 'application/json' } : undefined,
}) as NextRequest;

describe('/api/goals/[id] ownership', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not update another user\'s goal', async () => {
    mocks.getCurrentUserId.mockResolvedValue('user-a');
    mocks.findFirst.mockResolvedValue(null);

    const response = await PUT(requestFor('PUT'));

    expect(response.status).toBe(404);
    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: { id: 'goal-owned-by-b', userId: 'user-a' },
    });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('does not delete another user\'s goal', async () => {
    mocks.getCurrentUserId.mockResolvedValue('user-a');
    mocks.deleteMany.mockResolvedValue({ count: 0 });

    const response = await DELETE(requestFor('DELETE'));

    expect(response.status).toBe(404);
    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { id: 'goal-owned-by-b', userId: 'user-a' },
    });
  });
});
