# Training map: concepts in the guides vs. this project

This maps the topics in the two UI Engineer guides (Basic to Intermediate v2, and
Advanced v2) and the training checklist onto the Bug Bazaar code. It shows where each
concept appears in the project, and what is still missing.

The checklist describes a different final project (a Customer List, 20 products, and a
Rs. discount above 5,000). This project is a store with 5,000 products, USD prices in cents,
and a free-shipping rule at $50. Where the checklist names a different feature, the closest
equivalent here is listed.

Status key:

- **Done:** built and checked in this project.
- **Partial:** the concept is present, but a checklist item isn't fully met.
- **Gap:** not built. Candidate for a small change.
- **You:** a personal exercise (predict, explain, or practice). The project can't do it for you.

## Stage 1: Day 0 and Level 0 (setup, syntax, core JavaScript)

| Concept (guide section)                                 | Where in the project                                                                           | Status                               |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------ |
| Node, Vite React project, dev server (0.2, 0.3)         | `package.json` scripts, `npm run dev` on port 5173                                             | Done                                 |
| Syntax, arrow functions, template literals (0.4 to 0.6) | Arrow components throughout `src/`; `` `product-${id}` `` in `ProductCard`                     | Done                                 |
| Git: branches, commits, merge, push (0.7)               | Feature branches, PRs #1 to #3, the `Main protection` ruleset                                  | Done                                 |
| Types and `Number()` conversion (1)                     | Quantity input parsed with `Number()` in `pages/Cart.tsx`                                      | Partial: no `validatePrice` function |
| Conditions and falsy values (2)                         | `disabled={!product.stock}` on the add button, with the stock check enforced on the server too | Done                                 |
| Functions, pure functions (3)                           | `utils/catalog.ts`: `money`, `cartTotal`, `shippingFor`, `filterProducts`                      | Done                                 |
| Arrays and objects: map, filter, reduce (4)             | `cartTotal` uses `reduce`; `filterProducts` uses `filter` and `sort`                           | Done                                 |
| Scope (5)                                               | Module-level listener set in `utils/toast.ts`; cache map in `api/cache.ts`                     | Done                                 |
| Loops (Supplement 4)                                    | `Array.from` in the `Stars` component; `lines.map` in the cart                                 | Done                                 |
| Hoisting and TDZ (6)                                    | No code examples; the learner exercise is to write the snippets                                | You                                  |

## Stage 2: Week 1 (JavaScript execution, async, DOM)

| Concept (guide section)                        | Where in the project                                                                                      | Status                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Call stack and try/catch (7)                   | `try`/`catch` in `Checkout.place()`, which maps errors to state                                           | Partial: no written call-stack record |
| Closures (8)                                   | `addToCart` in `ProductCard` captures `product`; the `seq` ref in `Catalog`                               | Done                                  |
| Event loop: microtasks and timers (9)          | `setTimeout` in `ProductCard` (reset "Added") and `Toaster` (auto-dismiss); Promise chains in `request()` | Done                                  |
| Fetch, `response.ok`, status to message (10)   | `request()` in `api/client.ts`; `userMessage()` maps 400, 401, 404, 409, and 500                          | Done                                  |
| Web app request flow (Supplement 1)            | `docs/ARCHITECTURE.md` data-flow diagram; `docs/orders.md`                                                | Done                                  |
| Client vs server validation (Supplement 2)     | Stock check and idempotency are on the mock server; UI checks are only convenience                        | Done                                  |
| DevTools: Network, DOM, storage (Supplement 3) | Steps in `docs/day2-verification.md` and `docs/day3-verification.md`                                      | Done                                  |
| Event delegation (Supplement 5)                | Not built. The app attaches handlers directly to each button.                                             | Gap                                   |

## Stage 3: Week 2 (React basics)

| Concept (guide section)                                        | Where in the project                                                                                     | Status  |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------- |
| Modules and API functions (11)                                 | `api/services.ts`, one function per endpoint                                                             | Done    |
| Spread and immutability (11)                                   | Redux Toolkit reducers (Immer) in `store/index.ts`                                                       | Done    |
| Components, lists, stable keys (12)                            | `ProductCard` keyed by `product.id`; cart rows keyed by `product.id`                                     | Done    |
| State and derived values (13)                                  | `visibleProducts` is derived in `Catalog`; `cartCount` and `cartTotal` are derived in `utils/catalog.ts` | Done    |
| Controlled forms with validation (14)                          | Login (`Auth.tsx`) and the quantity input. No standalone `ProductForm` with tests.                       | Partial |
| Data flow: props down, callbacks up (13)                       | Cart and checkout read from the store and dispatch actions                                               | Done    |
| Component lifecycle and cleanup (Supplement 6)                 | Effects with cleanup in `Catalog`, `ProductDetails`, and `useBackToTop`                                  | Done    |
| Routing with refresh (Supplement 7)                            | Routes in `App.tsx`; the GitHub Pages `404.html` copy makes refresh work                                 | Done    |
| State ownership: local, shared, server, derived (Supplement 8) | Table in `docs/ARCHITECTURE.md`                                                                          | Done    |

## Stage 4: Week 3 (APIs, hooks, Redux Toolkit, TypeScript)

| Concept (guide section)                                | Where in the project                                                                                                | Status  |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------- |
| HTTP contracts with status codes (15)                  | `docs/api-contract.md`; `mocks/server.ts`                                                                           | Done    |
| `useEffect` with `AbortController` (16)                | `Catalog.tsx`, `ProductDetails.tsx`                                                                                 | Done    |
| UI states: loading, empty, error, retry, success (17)  | `StateView` and the skeleton grid. A dashboard with one failing panel isn't built.                                  | Done    |
| Redux Toolkit slice and selectors (18)                 | `cart` and `session` slices; `cartCount` and `cartTotal` as selectors                                               | Done    |
| Custom hooks, justified (18)                           | `useDebounced`, `useBackToTop`, with tests in `hooks.test.tsx`                                                      | Done    |
| TypeScript: typed props, API types, unions (19)        | `types/api.ts`: `Remote<T>` union, `RemoteError`, `Category`, `Sort`                                                | Done    |
| Auth: 401 vs 403 (Supplement 9)                        | 401 handled (sign-out, redirect). 403 is never returned, and the code has no handling for it.                       | Partial |
| Accessibility: keyboard, focus, labels (Supplement 10) | Labels, `role="alert"`, `aria-invalid`, and `aria-describedby` in the login form. No modal to test with a keyboard. | Partial |
| Code review (Supplement 11)                            | Written review comments are not in the repo. The review partner's PR review is still pending.                       | You     |

## Stage 5: Week 4 (engineering readiness, architecture, advanced)

| Concept (guide section)                                          | Where in the project                                                                                                       | Status  |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------- |
| Performance: waterfall and bottleneck (20)                       | `docs/performance.md` with Lighthouse before and after                                                                     | Done    |
| Testing with Vitest and Testing Library (20b)                    | 53 tests. There's no `ProductCard` sold-out or add-to-cart test, and no `validatePrice`.                                   | Partial |
| Architecture: one place for pricing rules (21)                   | `shippingFor` is the one place for the shipping rule. There's no `pricing.ts`.                                             | Partial |
| AI workflow journal (21)                                         | `docs/ai-notes.md`                                                                                                         | Done    |
| One-page architecture review (21)                                | `docs/ARCHITECTURE.md`                                                                                                     | Done    |
| Git, CI, CD: PR checklist and env differences (Supplement 12)    | CI, the ruleset, and the Pages deploy are built. The PR checklist and the list of environment differences aren't written.  | Partial |
| Architecture vocabulary (Supplement 4)                           | `docs/glossary.md` covers 6 terms. The checklist asks for 11 with frontend impact.                                         | Partial |
| Backend errors: duplicate email, 500, offline (Supplement 13)    | Field errors on login, the 409 and 500 screens, and offline handling through the network message. No duplicate-email case. | Partial |
| Caching: headers and stale data (Supplement 14)                  | `docs/caching.md`. Cache-Control and ETag headers haven't been inspected, because the mock has no HTTP headers.            | Partial |
| Queues and job states (Supplement 15)                            | Order status `queued` and the design in `docs/orders.md`. No pending, ready, failed, or expired UI.                        | Partial |
| Race conditions, reproduced and fixed (Supplement 16)            | Request key plus `seq` counter; the bug was reproduced and fixed in Day 2                                                  | Done    |
| Memoization and virtualization, with measurement (Supplement 17) | Decisions in `docs/performance.md`. No before-and-after `useMemo` measurement.                                             | Partial |
| WebSockets: connection states (Supplement 18)                    | The reasoning is in `docs/decisions.md`. No connecting, connected, or lost UI.                                             | Partial |
| Design patterns and API adapter (Supplement 19)                  | Adapter in `services.ts`; patterns in `docs/ARCHITECTURE.md`                                                               | Done    |
| Monitoring checklist and image fallback (Supplement 20)          | `docs/monitoring.md` and the error boundary. No image-failure fallback.                                                    | Partial |

## Final project (checklist)

| Item                                                                    | Here                                                                                        | Status  |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------- |
| Repo, data module, product list with keys                               | Products load through `api`, not hardcoded; keys use `product.id`                           | Done    |
| Live search and filters as source state, derived list                   | `Catalog.tsx`                                                                               | Done    |
| Add to cart: repeated add increments quantity, row count stays the same | `store.test.ts`: "adds a product, then increments its quantity up to stock"                 | Done    |
| Remove, decrement, count, subtotal, boundary rule                       | Remove and count are done. The boundary is at $50 for shipping, not a discount above 5,000. | Partial |
| TypeScript with no `any`, compiles                                      | Strict mode, lint bans `any`                                                                | Done    |
| UI states: loading, empty, error, retry, success                        | `StateView`, skeletons, retry                                                               | Done    |
| Tests for pricing and validation                                        | 53 tests, mostly store, pages, and utils                                                    | Partial |
| AI notes file in the repo                                               | `docs/ai-notes.md`                                                                          | Done    |
| Mock evaluation, practical dashboard, review call                       | Not in the repo. These are your preparation.                                                | You     |

## Gaps you could close next

These are small, and each one ties to a checklist item:

1. **`ProductCard` tests:** add to cart, the "Added" state, and a disabled sold-out button. Covers Week 4 testing.
2. **Image-failure fallback:** when a product image fails, show the emoji tile. Covers Supplement 20.
3. **Keyboard-tested dialog:** a "Clear cart?" confirmation that traps focus and closes on Escape. Covers Supplement 10.
4. **403 handling in the request layer:** map 403 to "You don't have access" and test it. Covers Supplement 9.
5. **Measured `useMemo` on the catalog filter:** before-and-after numbers in `docs/performance.md`. Covers Supplement 17.
6. **Two docs:** a PR checklist and five environment differences that could break staging. Covers Supplement 12.
7. **Glossary completion:** add the five missing terms, with frontend impact for each. Covers Supplement 4.

## What only you can do

Several checklist items are exercises or assessments that the project can't provide:
predicting outputs, explaining concepts, the mock evaluation, the review call, and the
practical dashboard. For these, use the answer keys in the guides, and check your reasoning
against the code in this project.
