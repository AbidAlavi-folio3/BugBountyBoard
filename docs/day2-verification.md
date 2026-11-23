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
