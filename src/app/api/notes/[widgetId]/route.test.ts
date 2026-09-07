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
    note: {
      findUnique: mocks.findUnique,
      upsert: mocks.upsert,
    },
  },
}));

import { GET, PUT } from './route';

describe('/api/notes/[widgetId] ownership', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not read another user\'s note through a guessed widget ID', async () => {
    mocks.getCurrentUserId.mockResolvedValue('user-a');
    mocks.findUnique.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/notes/widget-owned-by-b') as NextRequest);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ content: '' });
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { userId_widgetId: { userId: 'user-a', widgetId: 'widget-owned-by-b' } },
    });
  });

  it('updates only the current user\'s note record', async () => {
    mocks.getCurrentUserId.mockResolvedValue('user-a');
    mocks.upsert.mockResolvedValue({ id: 'note-a', userId: 'user-a', widgetId: 'widget-owned-by-b', content: 'safe' });

    const response = await PUT(new Request('http://localhost/api/notes/widget-owned-by-b', {
      method: 'PUT',
      body: JSON.stringify({ content: 'safe' }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect(response.status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalledWith({
      where: { userId_widgetId: { userId: 'user-a', widgetId: 'widget-owned-by-b' } },
      create: { userId: 'user-a', widgetId: 'widget-owned-by-b', content: 'safe' },
      update: { content: 'safe' },
    });
  });
});
