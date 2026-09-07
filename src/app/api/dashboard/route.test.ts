import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findUnique: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock('next-auth', () => ({ getServerSession: mocks.getServerSession }));
vi.mock('@/auth', () => ({ authOptions: {} }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    userLayout: {
      findUnique: mocks.findUnique,
      upsert: mocks.upsert,
    },
  },
}));

import { GET, PUT } from './route';

const state = { widgets: [], layout: [] };

describe('/api/dashboard ownership', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads only the authenticated user\'s layout', async () => {
    mocks.getServerSession.mockResolvedValue({ user: { id: 'user-a' } });
    mocks.findUnique.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mocks.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-a' } });
  });

  it('saves the layout under the authenticated user, ignoring a body userId', async () => {
    mocks.getServerSession.mockResolvedValue({ user: { id: 'user-a' } });
    mocks.upsert.mockResolvedValue({});

    const response = await PUT(new Request('http://localhost/api/dashboard', {
      method: 'PUT',
      body: JSON.stringify({ state, userId: 'user-b' }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect(response.status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-a' },
      create: { userId: 'user-a', layout: JSON.stringify(state) },
      update: { layout: JSON.stringify(state) },
    });
  });
});
