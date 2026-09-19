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
    let options: { onSuccess?: () => void } | undefined;
    mocks.useQueryClient.mockReturnValue({ invalidateQueries });
    mocks.useMutation.mockImplementation((nextOptions: typeof options) => {
      options = nextOptions;
      return nextOptions;
    });

    useCreateFocusSession();
    options?.onSuccess?.();

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['analytics'] });
  });
});
