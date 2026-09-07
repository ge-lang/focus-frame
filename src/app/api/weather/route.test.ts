import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

describe('/api/weather configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.OPENWEATHER_API_KEY;
    delete process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  });

  it('returns 503 without a server-side API key', async () => {
    const { GET } = await import('./route');
    const response = await GET(new NextRequest('http://localhost/api/weather?city=Brussels'));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: 'Weather service is not configured' });
  });
});
