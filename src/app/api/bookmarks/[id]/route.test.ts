import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getCurrentUserId: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({ getCurrentUserId: mocks.getCurrentUserId }));
vi.mock('@/lib/prisma', () => ({
  prisma: { bookmark: { deleteMany: mocks.deleteMany } },
}));

import { DELETE } from './route';

describe('/api/bookmarks/[id] ownership', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not delete another user\'s bookmark', async () => {
    mocks.getCurrentUserId.mockResolvedValue('user-a');
    mocks.deleteMany.mockResolvedValue({ count: 0 });

    const response = await DELETE(new Request('http://localhost/api/bookmarks/bookmark-owned-by-b') as NextRequest);

    expect(response.status).toBe(404);
    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { id: 'bookmark-owned-by-b', userId: 'user-a' },
    });
  });
});
