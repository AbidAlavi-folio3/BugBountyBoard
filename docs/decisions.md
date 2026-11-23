# Decisions

One entry per decision, in task order. Each entry says what was chosen, what
else was considered, and why.

## D1-1 Tooling

- **Chosen:** Vite 5, TypeScript, Prettier (`.prettierrc.json`), ESLint flat config
  with typescript-eslint and react-hooks rules.
- **TypeScript 5.9, not 7:** typescript-eslint supports TypeScript below 6.1, so
  7.x caused an install conflict. Pinned to `~5.9`.
- **vitest 2.x:** the latest vitest failed to install next to Vite 5.4 (an
  ERESOLVE peer conflict), so 2.x is pinned. The version can be revisited after a Vite upgrade.
- **Line endings:** Git on Windows writes CRLF, so Prettier uses `endOfLine: auto`.

## D1-2 Mock API

- **Chosen:** an in-process mock behind the same `request()` function, switched by
  `VITE_API_MODE`.
- **Considered:** MSW (Mock Service Worker). It works in the browser and in tests,
  but it needs a service worker file and an extra setup step.
- **Why:** nothing extra to run, the tests call the mock directly, and switching
  to a real API is one environment variable.

## D1-3 TypeScript

- **Chosen:** `strict: true`. The lint config bans `any`.
- **Why:** the shared contract types catch mismatches between pages and the API.
- **Note:** an unused service file from an earlier attempt was removed, along with
  the Week 1 starter files.

## D1-4 One request layer

- **Chosen:** every call goes through `request()`, which adds the auth header,
  parses errors, and handles 401.
- **Considered:** calling `fetch` in each component.
- **Why:** one place to change auth, errors, and the base URL.

## D2-1 Product list

- **Chosen:** a card grid with an emoji for each product image.
- **Why:** there are no image assets to host, and the grid still shows name,
  price, and stock.

## D2-2 Filters in the URL

- **Chosen:** search, category, sort, page, and in-stock live in the URL query.
- **Considered:** Redux or `useState`.
- **Why:** a refresh, a copied link, and the Back button all work without extra
  code. Filters describe the view, not app data, so they don't belong in Redux.

## D2-3 Request state

- **Chosen:** `Remote<T>` is a union of `loading`, `success`, and `error`.
- **Why:** an impossible state (data and an error at once) can't be written.

## D2-4 Cleanup and stale responses

- **Chosen:** `AbortController` on each request, and results tagged with the
  request key they belong to.
- **Why:** a slow old response can't overwrite a newer one.

## D2-5 Custom hooks

- **Chosen:** `useDebounced` (300 ms) and `useBackToTop`, both in `src/hooks`.
- **Why:** the logic is used in more than one place, and each hook has its own
  tests.

## D2-6 Race conditions

- **Chosen:** a sequence counter plus abort. Only the newest response is shown.
- **Fixed during testing:** Clear filters was undone by the debounced search. The
  URL is now written only after the input has settled.

## D3-1 Redux Toolkit

- **Chosen:** Redux Toolkit for the cart and session, with `store.subscribe` to
  save both to storage.
- **Considered:** `useReducer` with Context, and Zustand.
- **Why:** the cart is needed in several places (header, cart, checkout), and
  Redux Toolkit gives a clear list of allowed changes.

## D3-2 Cart and checkout

- **Chosen:** the cart is saved in `localStorage`. Quantities are clamped to stock
  in the reducer. The checkout key is kept in `sessionStorage` until the order
  succeeds.
- **Why:** the cart survives a reload. A retry after a reload reuses the key, so
  it can't create a second order.

## D3-3 Auth token storage

- **Chosen:** the token is in `sessionStorage`. See `docs/auth.md`.
- **Considered:** an httpOnly cookie.
- **Why:** a cookie needs CSRF protection and a server that sets it. The mock
  can't do that, so the trade-off is documented instead.

## D3-4 Error handling

- **Chosen:** `remoteError()` is the only place errors become page state.
- **Why:** each page uses the same messages, and raw server text never reaches the
  screen.

## D3-5 Caching

- **Chosen:** an in-memory cache with a 60-second TTL for product lists and
  details. A successful order clears it. The cart's stock sync skips it.
- **Considered:** TanStack Query or SWR, which add deduplication, retries, and
  background refresh.
- **Why not yet:** the cache is small and easy to explain. A library would be the
  next step if the app grew. The trade-off is in `docs/caching.md`.

## D4-3 Memoization and virtualization

- **Chosen:** no virtualization, and no `React.memo` on product cards.
- **Why:** the API returns 24 products per page, so the DOM never holds 5,000
  items. Cards re-render on each keystroke, which is small work. Nothing measured
  a problem, so nothing was added. Details and numbers are in `docs/performance.md`.
- **Would change if:** the page size grew, or profiling showed the grid re-rendering
  costly work.

## D4-4 Live stock: polling, not WebSockets

- **Chosen:** the cart polls the stock of its products every 15 seconds, using
  `productFresh()`, which skips the cache (`src/App.tsx`).
- **Considered:** WebSockets, and Server-Sent Events.
- **Why polling for this app:** the cart only needs stock every few seconds, the
  request count is small (one call per cart line), and it works through any proxy
  or CDN. No server-side connection state is needed.
- **How the requirements are met:** a failed poll is ignored and the next tick
  retries, so the feed recovers after a disconnect. The interval is cleared when
  the app unmounts, so polling stops when the page goes away.
- **How WebSockets would work:** the server keeps a connection open per client and
  pushes a message when a product's stock changes. Clients reconnect with backoff
  after a drop, and resync the full stock list on reconnect, because they may have
  missed messages. Choose WebSockets when updates are frequent, need to arrive
  within a second, or flow both ways (such as chat). For a cart that checks stock
  every 15 seconds, the extra connection management isn't worth it.

## D4-1 Accessibility

- **Chosen:** darken the text colors that failed the 4.5:1 contrast check, rather
  than change the layout or add a theme.
- **Why:** contrast was the only audit that failed, and darkening the text kept the
  design. Accessibility scores went from 95 to 100 on home, cart, and login.
- **Not yet:** a keyboard-only pass through the store.

## D4-2 Performance: self-hosted fonts

- **Chosen:** bundle DM Sans and Space Grotesk with `@fontsource`, instead of loading
  them from Google Fonts.
- **Considered:** keeping Google Fonts and moving the link into `index.html`. That
  saved about 0.15 s, while self-hosting saved about 0.7 s.
- **Why:** the font request was the largest cost on first paint, and nothing else in
  the app needed changing. The numbers are in `docs/performance.md`.
- **Tried and removed:** route-level code splitting, which didn't change the home page.

## D4-5 Testing

- **Chosen:** test behaviour through the real components and the mock API, using
  jsdom and React Testing Library, rather than only testing helpers.
- **Why:** the buying flow (cart rules, login, and checkout with its 409) is where a
  bug would hurt most, so it gets page-level tests.
- **Not yet:** end-to-end tests in a real browser (Playwright). Listed as the next step
  in `docs/reflection.md`.

## D4-6 CI

- **Chosen:** one GitHub Actions workflow that runs lint, format check, typecheck,
  tests, and build on every push and pull request.
- **Why:** a single job named `check` is simple to require in a ruleset. A ruleset on
  `main` requires it, so a failing check blocks the merge.

## D4-7 Monitoring

- **Chosen:** route caught render errors through one `reportError()` function with a
  swappable reporter, and document three metrics to track.
- **Why:** no monitoring service is connected, so the code only logs to the console
  today, but adding Sentry later is one call (`setErrorReporter`).
- **Not yet:** window-level error and promise-rejection listeners. See `docs/monitoring.md`.
