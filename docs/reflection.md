# Reflection

> **Draft.** These ratings are my honest first pass from the code and checks in
> this repo. Change any number that doesn't match your own judgment before you
> submit. The rule in the PDF is that you rate each topic out of 10 and name two gaps.

## Ratings (out of 10)

| Topic                      | Rating | Why                                                                                                                            |
| -------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Setup and tooling          | 7      | Install, scripts, Prettier, and ESLint all work. The TypeScript pin and the lint rule set are explained.                       |
| HTTP and API contracts     | 7      | The contract is documented, and the mock matches it. The PDF's 500 is only simulated on the product list.                      |
| TypeScript                 | 7      | Strict mode, no `any`, and typecheck passes. One dead file remains.                                                            |
| Data layer (request layer) | 7      | One `request()` function with auth, error parsing, and 401 handling.                                                           |
| Product list and details   | 6      | Grid, prices from cents, and details work in the browser. Keyboard-only use is not checked yet.                                |
| Filters and URL state      | 7      | Refresh, copied link, and Back work. The clear-filters bug was found and fixed in testing.                                     |
| UI states                  | 7      | Loading, empty, error, and retry checked in the browser.                                                                       |
| Effects and cleanup        | 6      | Requests are aborted and listeners removed, and the hook is tested. Quick product switching isn't browser-tested.              |
| Custom hooks               | 7      | Two typed hooks with 4 tests.                                                                                                  |
| Race conditions            | 7      | Fast typing ends on the latest query. Checked in the browser.                                                                  |
| Redux Toolkit              | 7      | Slices, derived badge, and storage sync. The badge is checked in the browser, the rest in code.                                |
| Cart and checkout          | 6      | Quantity cap, reload, and 409 are checked. The 500 retry during checkout isn't checked in the browser.                         |
| Auth                       | 6      | Login errors, return-after-login, and `docs/auth.md`. The 401 sign-out path is only checked in code.                           |
| Backend errors             | 7      | One mapping, with 404 and 409 screens. Checkout 500 retry is untested.                                                         |
| Caching                    | 6      | TTL cache, clear on order, and the stock sync bypass. Revisit behaviour isn't browser-tested.                                  |
| Accessibility              | 6      | Lighthouse accessibility is 100 on home, cart, and login after the contrast fixes. Keyboard-only use is not checked yet.       |
| Performance                | 6      | First paint 2.52 s to 1.82 s by self-hosting fonts, measured on the production build. Only one fix had a measured gain.        |
| WebSockets                 | 5      | Polling chosen on purpose, with the WebSocket trade-offs written up. Not implemented, and not browser-tested.                  |
| Testing                    | 7      | 51 tests, including page-level tests for login and checkout (success and 409). No end-to-end browser tests.                    |
| CI and CD                  | 6      | Workflow runs lint, format, typecheck, tests, and build. Not yet run on GitHub, and branch protection is not set.              |
| Monitoring                 | 6      | Render errors go through one reporter, with a fallback screen, and three metrics are documented. No real service is connected. |

## Two gaps

### Gap 1: no end-to-end browser tests

- **Gap:** the page tests render components with the mock API in jsdom. Nothing drives the real app in a browser, so routing, the dev server, and real timing are untested. Browser checks so far were manual scripts recorded in `docs/day2-verification.md` and `docs/day3-verification.md`.
- **Next step:** add a Playwright test for the full shopping flow (browse, filter, add to cart, log in, check out, and see the 409 for `p1`), and run it in CI.

### Gap 2: keyboard use and live stock are not checked

- **Gap:** Lighthouse measures the page, not how it feels to use. The keyboard-only path through the grid, the cart, and checkout hasn't been walked through, and the 15-second stock sync hasn't been watched in a browser.
- **Next step:** do one keyboard-only pass through home, cart, and checkout, noting anything unreachable or unclear. Then change one product's stock in the mock and confirm the cart updates within about 15 seconds. Record both in `docs/day4-verification.md`.
