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
