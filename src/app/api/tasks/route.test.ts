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
});
