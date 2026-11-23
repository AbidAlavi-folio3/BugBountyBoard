# Day 3 (Buy): verification notes

"Browser" means the running app was driven with scripted steps. "Code" means it
was checked by reading and by tests. Items marked _not browser-tested_ are
still open.

## D3-1 Redux Toolkit

- Cart and session state live in Redux (`src/store/index.ts`). Changes only go
  through the slice reducers (`add`, `quantity`, `remove`, `clear`, `syncStock`,
  `signIn`, `signOut`). Components never edit state directly. _Code._
- The header badge is derived with `cartCount()`, not stored. _Browser:_ adding
  a product changed the badge from 0 to 1.

## D3-2 Cart and checkout

- Quantity can't go above stock. _Browser:_ typing 999 for an item with stock 2
  left the field at 2. The reducer also clamps the value.
- The cart survives a reload. _Browser:_ a cart line was still there after a
  reload before checkout.
- A 409 names the item that ran out. _Browser:_ "Developer Coffee Beans 001 is out
  of stock." No "Try again" is offered, because retrying can't help.
- A retried checkout can't create a second order. The key is kept in
  sessionStorage until success (`src/pages/Checkout.tsx`), and the server returns
  the existing order for a completed key (`server.test.ts`). _Code and tests.
  Not browser-tested for a reload during a live checkout._

## D3-3 Auth

- A wrong password shows "Email or password is incorrect." _Browser._
- Protected pages redirect to login, and after a successful login the user returns
  to the page they asked for. _Browser:_ `/account` redirected to `/login`, and
  logging in returned to `/account`.
- The submit guard uses a ref, so a fast double click sends one request. _Code._
- A 401 on an authenticated call signs the user out. _Code._ Not browser-tested,
  because the mock token never expires.
- `docs/auth.md` explains where the token is stored and the trade-off.

## D3-4 Backend errors

- Every error goes through `remoteError()` (`src/api/client.ts`). Raw server text
  never reaches the screen.
- 404: "Product not found" and "Order not found". _Browser._
- 409: names the item. _Browser._
- 500: "Try again" on checkout and retry on the catalog and details pages. _Code._
  The mock API only simulates 500 on the product list, so the checkout retry is
  _not browser-tested_.
- 400: login shows each field's message. _Code._
- 401: signs out. _Code._

## D3-5 Caching

- Revisiting a page within 60 seconds reuses cached data. _Code and tests_
  (`src/api/cache.test.ts`). _Not browser-tested._
- Stock is refreshed after an order, since `checkout()` clears the cache. _Code._
- The cart's stock sync bypasses the cache with `productFresh`, so stock changes
  reach the cart within about 15 seconds. _Code._ Found during this check: the
  sync had been using the cached call.
- Acceptable staleness is explained in `docs/caching.md`.

## How to reproduce the 409 (out of stock at checkout)

A 409 only happens when stock drops after an item is already in the cart. Sold-out
products can't be added, so the stock change is made by hand:

1. Add any in-stock product to the cart.
2. Open the browser console on the site and run:

```javascript
const id = JSON.parse(localStorage.getItem('bazaar-cart'))[0].product.id;
const s = JSON.parse(localStorage.getItem('bazaar-stock-v1') || '{}');
s[id] = 0;
localStorage.setItem('bazaar-stock-v1', JSON.stringify(s));
location.reload();
```

3. Go to `/checkout` and place the order. The alert names the item, and there is no
   "Try again" button.
