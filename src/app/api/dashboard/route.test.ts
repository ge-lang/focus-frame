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
      create: { userId: 'user-a', layout: JSON.stringify({ ...state, layoutVersion: 4 }) },
      update: { layout: JSON.stringify({ ...state, layoutVersion: 4 }) },
    });
  });

  it('rejects malformed dashboard state', async () => {
    mocks.getServerSession.mockResolvedValue({ user: { id: 'user-a' } });

    const response = await PUT(new Request('http://localhost/api/dashboard', {
      method: 'PUT',
      body: JSON.stringify({ state: { widgets: [{ id: 'w1', type: 'unsupported', colSpan: 1 }], layout: [] } }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect(response.status).toBe(400);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it('accepts the current wide widget spans used by the dashboard', async () => {
    mocks.getServerSession.mockResolvedValue({ user: { id: 'user-a' } });
    mocks.upsert.mockResolvedValue({});

    const wideState = {
      widgets: [{ id: 'analytics-1', type: 'analytics', colSpan: 8, rowSpan: 3 }],
      layout: [{ i: 'analytics-1', x: 0, y: 0, w: 8, h: 3, type: 'analytics' }],
    };
    const response = await PUT(new Request('http://localhost/api/dashboard', {
      method: 'PUT',
      body: JSON.stringify({ state: wideState }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect(response.status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalled();
  });

  it('canonicalizes layout type from the matching widget before persistence', async () => {
    mocks.getServerSession.mockResolvedValue({ user: { id: 'user-a' } });
    mocks.upsert.mockResolvedValue({});

    const mismatchedState = {
      widgets: [{ id: 'todo-123', type: 'todo', colSpan: 8, rowSpan: 3 }],
      layout: [{ i: 'todo-123', x: 0, y: 0, w: 4, h: 3, type: 'notes' }],
    };
    const response = await PUT(new Request('http://localhost/api/dashboard', {
      method: 'PUT',
      body: JSON.stringify({ state: mismatchedState }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect(response.status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: expect.objectContaining({
        layout: JSON.stringify({
          ...mismatchedState,
          layoutVersion: 4,
          widgets: [{ id: 'todo-123', type: 'todo', colSpan: 4, rowSpan: 2 }],
          layout: [{ i: 'todo-123', x: 0, y: 0, w: 4, h: 2, type: 'todo' }],
        }),
      }),
      update: expect.objectContaining({
        layout: JSON.stringify({
          ...mismatchedState,
          layoutVersion: 4,
          widgets: [{ id: 'todo-123', type: 'todo', colSpan: 4, rowSpan: 2 }],
          layout: [{ i: 'todo-123', x: 0, y: 0, w: 4, h: 2, type: 'todo' }],
        }),
      }),
    }));
  });

  it('returns 400 for invalid JSON', async () => {
    mocks.getServerSession.mockResolvedValue({ user: { id: 'user-a' } });

    const response = await PUT(new Request('http://localhost/api/dashboard', {
      method: 'PUT',
      body: '{not-json',
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect(response.status).toBe(400);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});
