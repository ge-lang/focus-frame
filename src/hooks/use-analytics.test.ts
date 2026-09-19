import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: mocks.useMutation,
  useQuery: vi.fn(),
  useQueryClient: mocks.useQueryClient,
}));

import { useCreateFocusSession } from './use-analytics';

describe('focus-session analytics refresh', () => {
  beforeEach(() => vi.clearAllMocks());

  it('invalidates every analytics range after persistence succeeds', () => {
    const invalidateQueries = vi.fn();
    let options: { onSuccess?: () => void; mutationFn?: (session: { duration: number; type: 'work' | 'break' | 'long_break' }) => Promise<unknown> } | undefined;
    mocks.useQueryClient.mockReturnValue({ invalidateQueries });
    mocks.useMutation.mockImplementation((nextOptions: typeof options) => {
      options = nextOptions;
      return nextOptions;
    });

    useCreateFocusSession();
    options?.onSuccess?.();

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['analytics'], refetchType: 'active' });
  });

  it('surfaces the server persistence error through the mutation contract', async () => {
    const invalidateQueries = vi.fn();
    let options: { mutationFn?: (session: { duration: number; type: 'work' | 'break' | 'long_break' }) => Promise<unknown> } | undefined;
    mocks.useQueryClient.mockReturnValue({ invalidateQueries });
    mocks.useMutation.mockImplementation((nextOptions: typeof options) => {
      options = nextOptions;
      return nextOptions;
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Database unavailable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })));

    useCreateFocusSession();

    await expect(options?.mutationFn?.({ duration: 1500, type: 'work' })).rejects.toThrow('Database unavailable');
    vi.unstubAllGlobals();
  });
});
