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

import { shouldRetryFocusSessionWithoutTask, unlinkFocusSession, useCreateFocusSession } from './use-analytics';

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

  it('retries a stale task link as an unlinked session', () => {
    const session = { duration: 1500, type: 'work' as const, taskId: 'stale-task' };

    expect(shouldRetryFocusSessionWithoutTask(session, new Error('Task not found'))).toBe(true);
    expect(unlinkFocusSession(session)).toEqual({ duration: 1500, type: 'work' });
  });

  it('sends the unlinked payload after the server rejects a stale task relation', async () => {
    const invalidateQueries = vi.fn();
    let options: { mutationFn?: (session: { duration: number; type: 'work' | 'break' | 'long_break'; taskId?: string }) => Promise<unknown> } | undefined;
    mocks.useQueryClient.mockReturnValue({ invalidateQueries });
    mocks.useMutation.mockImplementation((nextOptions: typeof options) => {
      options = nextOptions;
      return nextOptions;
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Task not found' }), { status: 404 }))
      .mockResolvedValueOnce(new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    useCreateFocusSession();
    await options?.mutationFn?.({ duration: 1500, type: 'work', taskId: 'stale-task' });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ duration: 1500, type: 'work' });
    vi.unstubAllGlobals();
  });

  it('does not hide unrelated persistence failures', () => {
    expect(shouldRetryFocusSessionWithoutTask({ taskId: 'task-1' }, new Error('Failed to save focus session'))).toBe(false);
    expect(shouldRetryFocusSessionWithoutTask({}, new Error('Task not found'))).toBe(false);
  });
});
