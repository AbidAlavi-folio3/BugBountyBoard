# Reflection

> **Draft.** These ratings are my honest first pass from the code and checks in
> this repo. Change any number that doesn't match your own judgment before you
> submit. The rule in the PDF is that you rate each topic out of 10 and name two gaps.

## Ratings (out of 10)

| Topic | Rating | Why |
| --- | --- | --- |
| Setup and tooling | 7 | Install, scripts, Prettier, and ESLint all work. The TypeScript pin and the lint rule set are explained. |
| HTTP and API contracts | 7 | The contract is documented, and the mock matches it. The PDF's 500 is only simulated on the product list. |
| TypeScript | 7 | Strict mode, no `any`, and typecheck passes. One dead file remains. |
| Data layer (request layer) | 7 | One `request()` function with auth, error parsing, and 401 handling. |
| Product list and details | 6 | Grid, prices from cents, and details work in the browser. Keyboard-only use is not checked yet. |
| Filters and URL state | 7 | Refresh, copied link, and Back work. The clear-filters bug was found and fixed in testing. |
| UI states | 7 | Loading, empty, error, and retry checked in the browser. |
| Effects and cleanup | 6 | Requests are aborted and listeners removed, and the hook is tested. Quick product switching isn't browser-tested. |
| Custom hooks | 7 | Two typed hooks with 4 tests. |
| Race conditions | 7 | Fast typing ends on the latest query. Checked in the browser. |
| Redux Toolkit | 7 | Slices, derived badge, and storage sync. The badge is checked in the browser, the rest in code. |
| Cart and checkout | 6 | Quantity cap, reload, and 409 are checked. The 500 retry during checkout isn't checked in the browser. |
| Auth | 6 | Login errors, return-after-login, and `docs/auth.md`. The 401 sign-out path is only checked in code. |
| Backend errors | 7 | One mapping, with 404 and 409 screens. Checkout 500 retry is untested. |
| Caching | 6 | TTL cache, clear on order, and the stock sync bypass. Revisit behaviour isn't browser-tested. |
| Accessibility | 2 | Some labels and `aria-invalid` on the login form. No Lighthouse run and no keyboard-only pass. |
| Performance | 1 | Not started. |
| WebSockets | 2 | Polling is in place. No WebSocket comparison or implementation. |
| Testing | 5 | 39 tests across utils, the mock API, hooks, and cache. No page or component tests. |
| CI and CD | 1 | Not started. |
| Monitoring | 1 | Not started. |

## Two gaps

### Gap 1: no page-level tests for the buying flow

- **Gap:** the tests cover the mock API, utilities, hooks, and cache. None of them
  cover the cart, checkout, or the 409 path in the UI. Those are the parts most
  likely to break.
- **Next step:** add React Testing Library tests for the cart quantity cap and the
  checkout 409 message. Use the existing jsdom setup in `src/hooks/hooks.test.tsx`.

### Gap 2: accessibility and performance are unmeasured

- **Gap:** no Lighthouse score, no keyboard-only pass, and no measurement of the
  product list. The PDF requires 90 or higher on home, cart, and login, and
  before/after numbers for each performance fix.
- **Next step:** run Lighthouse on home, cart, and login in the browser. Fix the
  lowest-scoring issue on each page, and record the numbers in
  `docs/performance.md`.
