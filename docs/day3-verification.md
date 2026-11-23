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
