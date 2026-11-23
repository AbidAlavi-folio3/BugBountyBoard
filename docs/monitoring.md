# Monitoring

## What is caught and logged today

- **Render errors.** `ErrorBoundary` (`src/components/Ui.tsx`) catches any error
  thrown while rendering. It shows a "Something went wrong" screen with a reload
  button, so the page doesn't go blank.
- **Logging.** The boundary calls `reportError()` (`src/utils/logger.ts`). By default
  that logs the message, stack, component stack, and time to the console. The
  logger never throws, so a broken reporter can't break the fallback screen.
- **Plugging in a service.** Call `setErrorReporter(fn)` once at startup, for example
  in `main.tsx`, to send reports to Sentry or a similar tool. The app doesn't include
  one, because this project has no account or key to send to.
- **Tested.** `src/components/ErrorBoundary.test.tsx` checks the fallback screen and
  that the report includes the message and component stack.

Not caught yet: errors outside React rendering, such as a failed event handler, and
unhandled promise rejections. Those would need `window.onerror` and
`unhandledrejection` listeners that call `reportError()`.

## Three things to track

1. **Checkout success rate.** Orders placed divided by checkouts started. A drop
   means something broke in checkout, even when no error is thrown. Track 409s
   separately, because a rising 409 rate points to stock problems rather than bugs.
2. **API errors by status.** Count of responses by status code (400, 401, 404, 409, 500) and by endpoint. A rise in 500s is a server problem. A rise in 401s on
   protected pages can mean sessions are expiring too early.
3. **Render errors by route.** How often `ErrorBoundary` reports, grouped by the page
   the user was on. Any non-zero rate on a page that has been stable is worth a look.

## How I would collect them

- Send each `reportError()` report and each failed request to the monitoring service,
  tagged with route and status.
- Count checkout starts and successes as events, so the success rate is a ratio of
  two counts rather than a single error number.
- Set an alert on the checkout success rate and the 500 rate, not on every error.
