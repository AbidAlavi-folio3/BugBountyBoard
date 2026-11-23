# Day 2 (Browse): verification notes

How each Day 2 task was checked. "Browser" means the running app was driven
in a browser with scripted steps. "Code" means it was checked by reading and
tests only.

Baseline commit `35f798a` already contains most of Day 2. Commits with IDs
record what was checked and what changed.

## D2-1 Product list

- Grid shows image, name, category, rating, price, and stock for each product.
  Prices come from cents through `money()` (`499` shows as `$4.99`). *Browser.*
- Cards are links plus an "Add to cart" button, so both are reached with Tab. *Code.*
  A keyboard-only pass in the browser is still to do.

## D2-2 Filters

- Search, category, sort, page, and "In stock only" live in the URL, so a
  refresh or a copied link shows the same view. *Browser:* loading
  `?search=mechanical&sort=price-asc` restores both the box and the grid.
- Back goes to the previous filter state. *Browser:* after typing "keyboard"
  and pressing Back, the search box and results return to the cleared state.
- "Clear filters" resets everything. *Browser.* This failed before commit
  `4071e55` because a stale debounced value wrote the old search back into the
  URL. It now passes.
- Result count shows under the heading ("1,250 products"). *Browser.*

## D2-3 UI states

- Loading: skeleton grid on the list, "Loading product…" on details. *Browser.*
- Empty: "No matching products" with a clear action (search `zzzz-none`). *Browser.*
- Error: "Simulate server error (500)" shows "Products could not load" with
  "Service unavailable. Please retry." *Browser.*
- Retry: "Try again" starts a new request, and results return once the server
  responds. *Browser.*
- Success: product grid with pagination. *Browser.*

## D2-4 useEffect and cleanup

- Catalog aborts the in-flight request when filters change (`AbortController`),
  and ignores late responses. *Code.*
- ProductDetails aborts the request when the id changes, and stores results
  with their request key so an old product is never shown. *Code.*
- The stock-sync interval in `App.tsx` is cleared on unmount. *Code.*
- Back to Top's scroll listener is removed on unmount. *Tested* in
  `src/hooks/hooks.test.tsx`.
- Not yet verified in the browser: switching products quickly on the details page.
