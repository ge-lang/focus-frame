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

  it('persists an unlinked 25-minute focus session in seconds', async () => {
    mocks.getCurrentUserId.mockResolvedValue('user-a');
    mocks.create.mockResolvedValue({ id: 'session-1', userId: 'user-a', duration: 1500, type: 'work' });

    const response = await POST(new Request('http://localhost/api/focus-sessions', {
      method: 'POST',
      body: JSON.stringify({ duration: 1500, type: 'work' }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect(response.status).toBe(201);
    expect(mocks.create).toHaveBeenCalledWith({ data: { userId: 'user-a', duration: 1500, type: 'work', taskId: null } });
  });

  it('persists a task-linked 25-minute focus session for the authenticated owner', async () => {
    mocks.getCurrentUserId.mockResolvedValue('user-a');
    mocks.findFirst.mockResolvedValue({ id: 'task-owned-by-a', userId: 'user-a' });
    mocks.create.mockResolvedValue({ id: 'session-2', userId: 'user-a', duration: 1500, type: 'work', taskId: 'task-owned-by-a' });

    const response = await POST(new Request('http://localhost/api/focus-sessions', {
      method: 'POST',
      body: JSON.stringify({ duration: 1500, type: 'work', taskId: 'task-owned-by-a' }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect(response.status).toBe(201);
    expect(mocks.create).toHaveBeenCalledWith({ data: { userId: 'user-a', duration: 1500, type: 'work', taskId: 'task-owned-by-a' } });
  });

  it('returns a clean server error and records the request context when persistence fails', async () => {
    mocks.getCurrentUserId.mockResolvedValue('user-a');
    mocks.create.mockRejectedValue(new Error('database unavailable'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await POST(new Request('http://localhost/api/focus-sessions', {
      method: 'POST',
      body: JSON.stringify({ duration: 1500, type: 'work' }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Failed to save focus session' });
    expect(errorSpy).toHaveBeenCalledWith('Failed to save focus session', expect.objectContaining({
      userId: 'user-a',
      duration: 1500,
      type: 'work',
      taskId: null,
    }));
    errorSpy.mockRestore();
  });
});
