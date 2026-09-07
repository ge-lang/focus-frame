import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { axiosGet } = vi.hoisted(() => ({ axiosGet: vi.fn() }));

vi.mock('axios', () => ({
  default: {
    get: axiosGet,
    isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean }).isAxiosError),
  },
}));

describe('/api/weather configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    axiosGet.mockReset();
    delete process.env.OPENWEATHER_API_KEY;
    delete process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  });

  it('returns 503 without a server-side API key', async () => {
    const { GET } = await import('./route');
    const response = await GET(new NextRequest('http://localhost/api/weather?city=Brussels'));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: 'Weather service is not configured' });
  });

  it('scopes city search to the selected country', async () => {
    process.env.OPENWEATHER_API_KEY = 'server-only-test-key';
    axiosGet.mockResolvedValueOnce({ data: [{ name: 'Ghent', country: 'BE', lat: 51.05, lon: 3.72 }] });
    const { GET } = await import('./route');

    const response = await GET(new NextRequest('http://localhost/api/weather?search=Ghent&country=BE'));

    expect(response.status).toBe(200);
    expect(axiosGet).toHaveBeenCalledWith('https://api.openweathermap.org/geo/1.0/direct', {
      params: { q: 'Ghent,BE', limit: 8, appid: 'server-only-test-key' },
    });
    await expect(response.json()).resolves.toEqual([{ name: 'Ghent', state: null, country: 'BE', lat: 51.05, lon: 3.72 }]);
  });

  it.each([
    [404, 'City not found'],
    [429, 'Weather service rate limit reached'],
    [502, 'Weather service is temporarily unavailable'],
  ])('returns a controlled response for provider status %s', async (status, message) => {
    process.env.OPENWEATHER_API_KEY = 'server-only-test-key';
    axiosGet.mockRejectedValueOnce({ isAxiosError: true, response: { status } });
    const { GET } = await import('./route');

    const response = await GET(new NextRequest('http://localhost/api/weather?city=Brussels&country=BE'));

    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual({ error: message });
  });
});
