import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getCurrentUserId: vi.fn(),
  create: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({ getCurrentUserId: mocks.getCurrentUserId }));
vi.mock('@/lib/prisma', () => ({
  prisma: { bookmark: { create: mocks.create } },
}));

import { POST } from './route';

describe('/api/bookmarks URL validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUserId.mockResolvedValue('user-a');
  });

  it.each(['javascript:alert(1)', 'data:text/html,hello', 'file:///tmp/file.txt', 'ftp://example.com/file'])('rejects %s URLs', async (url) => {
    const response = await POST(new Request('http://localhost/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ title: 'Unsafe', url }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest);

    expect(response.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
