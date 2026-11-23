# Day 4 (Harden): verification notes

"Measured" means Lighthouse 12 on the production build, or a test that ran. Items
marked _not yet checked_ are still open.

## D4-1 Accessibility

- Lighthouse accessibility: 100 on home, cart, and login. _Measured._
- Login errors use `role="alert"`, and each field's message is linked with
  `aria-describedby`. _Code._
- Keyboard-only pass through the store: _not yet checked._

## D4-2 Performance

- First Contentful Paint on home: 2.52 s before, 1.82 s after self-hosting fonts.
  Performance score 93 to 97–98. _Measured._ Details in `docs/performance.md`.

## D4-3 Memoization and virtualization

- Skipped on purpose, with the reasons in `docs/decisions.md` and `docs/performance.md`.

## D4-4 Live stock

- The cart polls stock every 15 seconds, and a failed poll is retried on the next tick.
  _Code._
- Watching the cart update after a stock change in a browser: _not yet checked._

## D4-5 Testing

- 51 tests pass, including page-level tests for login (wrong password, sign-in),
  checkout (success, 409 with no retry, and key reuse), and cart rules. _Measured._

## D4-6 CI

- The CI workflow runs on every push and pull request. Its runs on the feature branch (commit `f55348c`) passed.
  The `check` job is required by the `Main protection` ruleset. _Checked through GitHub._
- The Pages deploy workflow (`deploy.yml`) has not run on `main` yet. _Not yet checked._

## D4-7 Monitoring

- Render errors are caught, shown with a fallback screen, and reported through
  `reportError()`. Tested in `src/components/ErrorBoundary.test.tsx`. _Tested._
