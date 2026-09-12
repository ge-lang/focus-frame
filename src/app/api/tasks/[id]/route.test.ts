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

const requestFor = (method: string, body?: Record<string, unknown>) => new Request('http://localhost/api/tasks/task-owned-by-b', {
  method,
  body: method === 'PUT' ? JSON.stringify(body ?? { title: 'Attempted takeover' }) : undefined,
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

  it('persists editable fields and semantic history from one save', async () => {
    mocks.getServerSession.mockResolvedValue({ user: { id: 'user-a' } });
    mocks.findFirst.mockResolvedValue({
      id: 'task-owned-by-b',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      history: null,
    });
    mocks.update.mockResolvedValue({ id: 'task-owned-by-b', status: 'done', priority: 'high', dueDate: new Date('2026-09-18T00:00:00.000Z') });

    const response = await PUT(requestFor('PUT', {
      title: 'Updated task',
      description: 'Details',
      status: 'done',
      priority: 'high',
      dueDate: '2026-09-18',
    }));

    expect(response.status).toBe(200);
    const updateCall = mocks.update.mock.calls[0][0];
    expect(updateCall.data).toMatchObject({
      title: 'Updated task',
      description: 'Details',
      status: 'done',
      priority: 'high',
      dueDate: new Date('2026-09-18T00:00:00.000Z'),
    });
    expect(updateCall.data.history).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'deadline_changed', from: null, to: '2026-09-18' }),
      expect.objectContaining({ type: 'priority_changed', from: 'medium', to: 'high' }),
      expect.objectContaining({ type: 'completed', from: 'todo', to: 'done' }),
    ]));
  });
});
