# Decisions

One entry per decision, in task order. Each entry says what was chosen, what
else was considered, and why.

## D1-1 Tooling

- **Chosen:** Vite 5, TypeScript, Prettier (`.prettierrc.json`), ESLint flat config
  with typescript-eslint and react-hooks rules.
- **TypeScript 5.9, not 7:** typescript-eslint supports TypeScript below 6.1, so
  7.x caused an install conflict. Pinned to `~5.9`.
- **vitest 2.x:** vitest 3 and later need a newer Vite than 5.4.
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
- **Note:** `src/services/productService.ts` is dead code from an earlier attempt.
  It compiles but isn't used. Delete it after review.

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

## D4 (not yet decided in writing)

The stock poll in `App.tsx` already runs every 15 seconds. The WebSocket
comparison will be recorded here when D4-4 is done.
