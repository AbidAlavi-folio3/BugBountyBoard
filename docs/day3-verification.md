# Day 3 (Buy): verification notes

"Browser" means the running app was driven with scripted steps. "Code" means it
was checked by reading and by tests. Items marked *not browser-tested* are
still open.

## D3-1 Redux Toolkit

- Cart and session state live in Redux (`src/store/index.ts`). Changes only go
  through the slice reducers (`add`, `quantity`, `remove`, `clear`, `syncStock`,
  `signIn`, `signOut`). Components never edit state directly. *Code.*
- The header badge is derived with `cartCount()`, not stored. *Browser:* adding
  a product changed the badge from 0 to 1.

## D3-2 Cart and checkout

- Quantity can't go above stock. *Browser:* typing 999 for an item with stock 2
  left the field at 2. The reducer also clamps the value.
- The cart survives a reload. *Browser:* a cart line was still there after a
  reload before checkout.
- A 409 names the item that ran out. *Browser:* "Developer Coffee Beans 001 is out
  of stock." No "Try again" is offered, because retrying can't help.
- A retried checkout can't create a second order. The key is kept in
  sessionStorage until success (`src/pages/Checkout.tsx`), and the server returns
  the existing order for a completed key (`server.test.ts`). *Code and tests.
  Not browser-tested for a reload during a live checkout.*

## D3-3 Auth

- A wrong password shows "Email or password is incorrect." *Browser.*
- Protected pages redirect to login, and after a successful login the user returns
  to the page they asked for. *Browser:* `/account` redirected to `/login`, and
  logging in returned to `/account`.
- The submit guard uses a ref, so a fast double click sends one request. *Code.*
- A 401 on an authenticated call signs the user out. *Code.* Not browser-tested,
  because the mock token never expires.
- `docs/auth.md` explains where the token is stored and the trade-off.

## D3-4 Backend errors

- Every error goes through `remoteError()` (`src/api/client.ts`). Raw server text
  never reaches the screen.
- 404: "Product not found" and "Order not found". *Browser.*
- 409: names the item. *Browser.*
- 500: "Try again" on checkout and retry on the catalog and details pages. *Code.*
  The mock API only simulates 500 on the product list, so the checkout retry is
  *not browser-tested*.
- 400: login shows each field's message. *Code.*
- 401: signs out. *Code.*

## D3-5 Caching

- Revisiting a page within 60 seconds reuses cached data. *Code and tests*
  (`src/api/cache.test.ts`). *Not browser-tested.*
- Stock is refreshed after an order, since `checkout()` clears the cache. *Code.*
- The cart's stock sync bypasses the cache with `productFresh`, so stock changes
  reach the cart within about 15 seconds. *Code.* Found during this check: the
  sync had been using the cached call.
- Acceptable staleness is explained in `docs/caching.md`.
