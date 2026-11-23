// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBackToTop, useDebounced } from './index';

describe('useDebounced', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value straight away', () => {
    const { result } = renderHook(() => useDebounced('a', 300));
    expect(result.current).toBe('a');
  });

  it('only updates after the value stops changing for the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounced(value, 300), {
      initialProps: { value: 'k' },
    });
    rerender({ value: 'ke' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'keyboard' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('k');
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('keyboard');
  });
});

describe('useBackToTop', () => {
  beforeEach(() => {
    window.scrollY = 0;
  });

  it('shows the button only after scrolling past the threshold', () => {
    const { result } = renderHook(() => useBackToTop(500));
    expect(result.current).toBe(false);

    window.scrollY = 600;
    act(() => window.dispatchEvent(new Event('scroll')));
    expect(result.current).toBe(true);

    window.scrollY = 100;
    act(() => window.dispatchEvent(new Event('scroll')));
    expect(result.current).toBe(false);
  });

  it('removes its scroll listener when unmounted', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useBackToTop(500));
    unmount();
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
    remove.mockRestore();
  });
});
