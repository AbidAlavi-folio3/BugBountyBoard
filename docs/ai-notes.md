# AI notes

> **Draft.** These entries are drawn from the real work on this branch. Check each
> prompt and "kept" line against your own memory before you submit. If something
> here doesn't match what you did, change it.

I used an AI coding assistant (Claude) throughout the project. Each entry below
records one notable use.

## 1. D1-1 and D1-3: fixing the install and type check

- **Prompt:** "Yes, fix it" (after I listed the blockers: the entry point, missing
  Redux and vitest packages, and failing type checks).
- **Kept:** the Vite entry change in `index.html`, the Redux, react-redux, and
  vitest installs, and the `typecheck` and `test` scripts.
- **Changed and why:** I first kept `src/services/productService.ts` and fixed its
  import, because the permission to delete was denied. Later I removed it, along with
  the unused Week 1 files. I checked
  the type check, tests, and build myself after each change. I did not take the
  assistant's word that they passed.

## 2. D2-2: clear filters bug, found in the browser

- **Prompt:** "start day 2". The assistant scripted browser tests for Browse.
- **Kept:** the diagnosis. The debounced search value was written back into the URL
  after "Clear filters", and the fix only writes once the input has settled.
- **Changed and why:** the fix was re-tested in the browser, including typing,
  Back, the error state, and retry. Those checks are recorded in
  `docs/day2-verification.md`.

## 3. D3-5: caching, and the stock sync it broke

- **Prompt:** "start day 3". The assistant added an in-memory cache for product
  lists and details, and cleared it after an order.
- **Kept:** the cache module, its tests, and clearing on checkout.
- **Changed and why:** re-reading the code for the caching doc showed that the
  15-second cart stock sync also went through the cache, so cart quantities would
  lag by up to a minute. The assistant added `productFresh()` to bypass the cache,
  and I checked that the sync calls it.

## One AI mistake and how I caught it

The first caching change made the 15-second stock sync read from the cache for
up to 60 seconds. The cart would not have shown stock changes in time. I caught it
when writing `docs/caching.md`, because the doc said the sync ran every 15
seconds, and I checked what that call actually did. The fix is in commit
`c5c8119`.

A second mistake: the first history rewrite grouped finished code into task-ID
commits, which could read as if the work was done per task on those dates. The
rewritten commits now say the code was written before the commit.

## One thing I wouldn't hand to AI

The honesty of the record: which tasks were really built, which were only checked,
and which are not done. The assistant drafted the "not browser-tested" notes, but
the judgment about what counts as done should be yours. An assistant is tempted to
mark every row as done, so each status needs a check against what was actually run.
