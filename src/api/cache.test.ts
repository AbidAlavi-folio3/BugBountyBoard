import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cached, clearCache } from './cache';

describe('cached', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearCache();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads once and reuses the value while fresh', async () => {
    const load = vi.fn(async () => 'data');
    expect(await cached('k', load)).toBe('data');
    expect(await cached('k', load)).toBe('data');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('loads again after the entry expires', async () => {
    const load = vi.fn(async () => 'data');
    await cached('k', load, 1000);
    vi.advanceTimersByTime(1001);
    await cached('k', load, 1000);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('does not cache a failed load', async () => {
    const load = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce('ok');
    await expect(cached('k', load)).rejects.toThrow('down');
    expect(await cached('k', load)).toBe('ok');
  });

  it('clearCache forces the next call to reload', async () => {
    const load = vi.fn(async () => 'data');
    await cached('k', load);
    clearCache();
    await cached('k', load);
    expect(load).toHaveBeenCalledTimes(2);
  });
});
