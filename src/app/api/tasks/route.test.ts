import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  create: vi.fn(),
}));

vi.mock('next-auth', () => ({ getServerSession: mocks.getServerSession }));
vi.mock('@/auth', () => ({ authOptions: {} }));
vi.mock('@/lib/prisma', () => ({
  prisma: { task: { create: mocks.create } },
}));

import { POST } from './route';

describe('/api/tasks input validation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 for invalid JSON', async () => {
    mocks.getServerSession.mockResolvedValue({ user: { id: 'user-a' } });

    const response = await POST(new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: '{not-json',
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect(response.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('rejects invalid status and date before writing', async () => {
    mocks.getServerSession.mockResolvedValue({ user: { id: 'user-a' } });

    const response = await POST(new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'Task', status: 'blocked', dueDate: 'not-a-date' }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect(response.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('returns the created task with an optional ISO deadline', async () => {
    mocks.getServerSession.mockResolvedValue({ user: { id: 'user-a' } });
    const createdTask = {
      id: 'task-1',
      title: 'Plan release',
      description: null,
      priority: 'medium',
      status: 'todo',
      isCompleted: false,
      dueDate: new Date('2026-09-09T00:00:00.000Z'),
      userId: 'user-a',
    };
    mocks.create.mockResolvedValue(createdTask);

    const response = await POST(new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'Plan release', dueDate: '2026-09-09' }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect(response.status).toBe(200);
    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        title: 'Plan release',
        description: null,
        priority: 'medium',
        status: 'todo',
        dueDate: new Date('2026-09-09T00:00:00.000Z'),
        isCompleted: false,
        userId: 'user-a',
      },
    });
    await expect(response.json()).resolves.toMatchObject({ id: 'task-1', dueDate: '2026-09-09T00:00:00.000Z' });
  });
});
