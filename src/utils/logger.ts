// One place to report unexpected errors. By default it logs to the console.
// A monitoring service (Sentry, Datadog, and so on) plugs in with
// setErrorReporter() at app start. See docs/monitoring.md.

export type ErrorReport = {
  message: string;
  stack?: string;
  componentStack?: string;
  at: string;
};

type Reporter = (report: ErrorReport) => void;

let reporter: Reporter = (report) => {
  console.error('[bazaar] unexpected error', report);
};

export function setErrorReporter(next: Reporter): void {
  reporter = next;
}

export function reportError(error: unknown, componentStack?: string): void {
  const err = error instanceof Error ? error : new Error(String(error));
  try {
    reporter({
      message: err.message,
      stack: err.stack,
      componentStack,
      at: new Date().toISOString(),
    });
  } catch {
    // A broken reporter must never break the page that is showing the error.
  }
}
