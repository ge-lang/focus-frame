import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock('next-auth', () => ({ getServerSession: mocks.getServerSession }));
vi.mock('@/auth', () => ({ authOptions: {} }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findFirst: mocks.findFirst,
      update: mocks.update,
      deleteMany: mocks.deleteMany,
    },
  },
}));

import { DELETE, PUT } from './route';

const requestFor = (method: string) => new Request('http://localhost/api/tasks/task-owned-by-b', {
  method,
  body: method === 'PUT' ? JSON.stringify({ title: 'Attempted takeover' }) : undefined,
  headers: method === 'PUT' ? { 'Content-Type': 'application/json' } : undefined,
}) as NextRequest;

describe('/api/tasks/[id] ownership', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not update another user\'s task', async () => {
    mocks.getServerSession.mockResolvedValue({ user: { id: 'user-a' } });
    mocks.findFirst.mockResolvedValue(null);

    const response = await PUT(requestFor('PUT'));

    expect(response.status).toBe(404);
    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: { id: 'task-owned-by-b', userId: 'user-a' },
    });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('does not delete another user\'s task', async () => {
    mocks.getServerSession.mockResolvedValue({ user: { id: 'user-a' } });
    mocks.deleteMany.mockResolvedValue({ count: 0 });

    const response = await DELETE(requestFor('DELETE'));

    expect(response.status).toBe(404);
    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { id: 'task-owned-by-b', userId: 'user-a' },
    });
  });
});
