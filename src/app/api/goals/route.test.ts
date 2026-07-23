import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getCurrentUserId: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({ getCurrentUserId: mocks.getCurrentUserId }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    goal: {
      findMany: mocks.findMany,
      create: mocks.create,
    },
  },
}));

import { GET, POST } from './route';

describe('/api/goals', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects an unauthenticated request', async () => {
    mocks.getCurrentUserId.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('only queries goals that belong to the signed-in user', async () => {
    mocks.getCurrentUserId.mockResolvedValue('user-1');
    mocks.findMany.mockResolvedValue([]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mocks.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }],
    });
  });

  it('validates goal input before writing to the database', async () => {
    mocks.getCurrentUserId.mockResolvedValue('user-1');
    const request = new Request('http://localhost/api/goals', {
      method: 'POST',
      body: JSON.stringify({ title: '', priority: 'urgent' }),
    }) as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
