// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './Ui';
import { setErrorReporter, type ErrorReport } from '../utils/logger';

function Broken(): never {
  throw new Error('render exploded');
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ErrorBoundary', () => {
  it('shows a fallback screen instead of crashing when a child throws', () => {
    // React logs the caught error to the console; keep the test output quiet.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    setErrorReporter(() => {});
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByRole('button', { name: /try again/i })).toBeTruthy();
  });

  it('reports the error with its message and component stack', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reports: ErrorReport[] = [];
    setErrorReporter((r) => reports.push(r));
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(reports).toHaveLength(1);
    expect(reports[0].message).toBe('render exploded');
    expect(reports[0].componentStack).toContain('Broken');
  });
});
