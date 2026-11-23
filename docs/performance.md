# Performance

All numbers are Lighthouse 12 runs in headless Chrome against `npm run build` output,
served with `vite preview`. The dev server is not used for measurement, because it
serves unbundled modules and gives misleading numbers.

Test setup: the catalog's mock API adds a 350 ms delay to every request
(`VITE_MOCK_DELAY_MS`). That delay is part of the test on purpose, because it's
how the store behaves in development.

## Baseline (before any fix)

Home page, median of 3 runs.

| Metric                   | Value                     |
| ------------------------ | ------------------------- |
| Performance score        | 93                        |
| First Contentful Paint   | 2.52 s                    |
| Largest Contentful Paint | 2.52 s                    |
| Total Blocking Time      | 0–32 ms                   |
| Speed Index              | 3.4 s                     |
| Accessibility score      | 95 (fails color contrast) |

The slowest spots, from the Lighthouse audits:

1. **Google Fonts loaded through `@import` in `styles.css`.** The import is found only
   after the stylesheet downloads, and it blocks rendering. "Render-blocking
   resources" estimated 1,460 ms of savings.
2. **Initial JavaScript.** About 21 KB of it is unused on the first page.

## Fix 1: self-host the fonts (kept)

I first moved the Google Fonts link into `index.html`, which saved about 0.15 s.
The render-blocking estimate was still about 1.3 s, so I tested whether the
font request was the cause. I removed the font entirely for one run:

| Run                                       | First Contentful Paint |
| ----------------------------------------- | ---------------------- |
| Baseline (Google Fonts via `@import`)     | 2.52 s                 |
| Font link in `index.html`                 | 2.36 s                 |
| Fonts removed (test only)                 | 1.22 s                 |
| **Self-hosted with `@fontsource` (kept)** | **1.82 s**             |

The fonts are now bundled with the app (`@fontsource/dm-sans`,
`@fontsource/space-grotesk`, imported in `src/main.tsx`). Nothing goes to Google
before first paint. The look is the same. The remaining gap to 1.22 s is the cost of
downloading the font files.

Result (home, median of 3 runs): **FCP 2.52 s → 1.82 s, performance 93 → 97–98.**

## Fix 2: lazy-load the other routes (tried, removed)

I split the Account, Login, Cart, Checkout, order, and product-details pages into
separate chunks with `React.lazy`. The home page didn't change: FCP stayed at
about 2.36 s, and the performance score stayed at 94–95. Most of the bundle is
React, Redux, and the router, which the home page needs. The split helps only
visitors who open those pages, and I couldn't show that in a measurement here.
I removed it to keep the code simple.

## Measuring the product list itself

The product list appears about 350 ms after the request starts, because of the mock
delay. The first screen shows a skeleton grid right away, so the page isn't blank
while it waits. Lighthouse's LCP element on the home page is the hero text, not the
product cards, so the product-list timing is in this section rather than in the
Lighthouse numbers.

## Final numbers

| Page  | Performance | Accessibility | FCP    |
| ----- | ----------- | ------------- | ------ |
| Home  | 98          | 100           | 1.82 s |
| Cart  | 98          | 100           | 1.82 s |
| Login | 98          | 100           | 1.82 s |

Accessibility went from 95 to 100 because of the color-contrast fixes. The
contrast change is in `styles.css`: the eyebrow, muted, category, rating, stock, sold,
footer, and hero text colors were darkened to at least 4.5:1 against their backgrounds.

## Memoization and virtualization (D4-3)

- **Virtualization: skipped.** The API returns results 24 at a time. The DOM never
  holds 5,000 products, so a virtual list would add complexity without a benefit.
- **`React.memo` on `ProductCard`: skipped.** The catalog re-renders on each
  keystroke in the search box, so all 24 cards re-render too. That is a small
  amount of work, and I didn't measure a problem, so I didn't add memoization. If
  the page size grew, this is the first thing to measure and fix.
