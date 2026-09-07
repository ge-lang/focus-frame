import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getCurrentUserId: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({ getCurrentUserId: mocks.getCurrentUserId }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: { findFirst: mocks.findFirst },
    focusSession: { create: mocks.create },
  },
}));

import { POST } from './route';

describe('/api/focus-sessions ownership', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects associating a focus session with another user\'s task', async () => {
    mocks.getCurrentUserId.mockResolvedValue('user-a');
    mocks.findFirst.mockResolvedValue(null);

    const response = await POST(new Request('http://localhost/api/focus-sessions', {
      method: 'POST',
      body: JSON.stringify({ duration: 1500, type: 'work', taskId: 'task-owned-by-b' }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect(response.status).toBe(404);
    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: { id: 'task-owned-by-b', userId: 'user-a' },
    });
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
