import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../src/core/auth', () => ({ accessToken: async () => 'test-token' }));
import { createTask, getLists, graphUrl } from '../src/core/graph';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

describe('Graph requests', () => {
  it('reads every list page and keeps the opaque nextLink', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        Response.json({
          value: [{ id: '1', displayName: 'First' }],
          '@odata.nextLink': 'https://graph.microsoft.com/v1.0/me/todo/lists?$skiptoken=opaque',
        }),
      )
      .mockResolvedValueOnce(Response.json({ value: [{ id: '2', displayName: 'Second' }] }));
    expect(await getLists('account')).toHaveLength(2);
    expect(String(vi.mocked(fetch).mock.calls[1]![0])).toContain('$skiptoken=opaque');
  });

  it('does not leak a bearer token to an untrusted pagination host', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ value: [], '@odata.nextLink': 'https://example.com/collect' }),
    );
    await expect(getLists('account')).rejects.toMatchObject({ code: 'invalid' });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(() => graphUrl('https://graph.microsoft.com.evil.test/v1.0/me')).toThrow('invalid');
  });

  it('marks a POST network loss as unknown and never retries it', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(createTask('account', 'list', { title: 'Test' })).rejects.toMatchObject({ code: 'unknown' });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('exposes a retry delay for throttling without immediately sending again', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('', { status: 429, headers: { 'Retry-After': '17' } }),
    );
    await expect(getLists('account')).rejects.toMatchObject({ code: 'rate_limited', retryAfter: 17 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
