# Caching

## What is cached

`src/api/cache.ts` keeps GET responses in memory for 60 seconds:

- the product list, keyed by its query string (search, category, sort, page, in-stock)
- each product's details, keyed by id

Revisiting a page within 60 seconds uses the stored data and does not refetch.
Simulated failures (`fail=500`) always go to the server and are never cached.
Nothing is written to localStorage, so a reload starts with an empty cache.

## What clears the cache

- **After a successful order**, `checkout()` calls `clearCache()`. Stock changed
  on the server, so the next page visit fetches fresh stock.
- **After 60 seconds**, an entry expires and the next request fetches again.
- **On reload**, the cache is empty.

## When stale data is acceptable

Some staleness is fine here, and some is not.

- **Acceptable:** a product list showing stock from up to 60 seconds ago. Browsing
  shouldn't wait for a fetch on every visit, and the list is only a guide.
- **Not acceptable:** trusting stock at checkout. The server checks stock when the
  order is placed and returns 409 for an item that ran out. The cart's stock check
  in `App.tsx` also runs every 15 seconds, and it updates cart quantities.

The rule is that the server is the authority on stock. The cache only makes
browsing faster.

## Trade-offs

- An in-memory cache is simple and private to the tab. It doesn't share data
  across tabs, and it doesn't survive a reload.
- A longer TTL means more stale stock on screen. A shorter one means more
  requests. 60 seconds is a balance for a store with a 5,000-item catalog.
- The cache doesn't deduplicate requests that are still in flight. Two
  components asking for the same key at once would both fetch.
