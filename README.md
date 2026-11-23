# The Bug Bazaar

A small store that sells developer gear: keyboards, rubber ducks, coffee, and
stickers. Built with React, TypeScript, Vite, and Redux Toolkit. The API is a mock
that runs in the browser, so no backend is needed.

## Run it (about 5 minutes)

Requirements: Node 22 or later, and npm.

```powershell
npm install
npm run dev
```

Open http://localhost:5173. Sign in with **demo@bugbazaar.dev / password123** to
check out.

## Scripts

| Command                | What it does                                                   |
| ---------------------- | -------------------------------------------------------------- |
| `npm run dev`          | Starts the dev server with hot reload                          |
| `npm run build`        | Production build into `dist/` (no type check; run `typecheck`) |
| `npm run preview`      | Serves the production build locally                            |
| `npm run lint`         | ESLint (TypeScript and React hooks rules)                      |
| `npm run format`       | Prettier, rewrites files in `src/`                             |
| `npm run format:check` | Prettier, fails if a file isn't formatted                      |
| `npm run typecheck`    | TypeScript in strict mode, no emit                             |
| `npm test`             | Runs the test suite once (vitest)                              |

Before pushing, run `npm run lint`, `npm run format:check`, `npm run typecheck`,
and `npm test`. CI runs the same checks, and the build too.

## Environment variables

Set these in a `.env.local` file, or in the shell. All are optional.

| Variable             | Default | Meaning                                                                   |
| -------------------- | ------- | ------------------------------------------------------------------------- |
| `VITE_API_MODE`      | mock    | Set to `real` to send requests to `VITE_API_BASE_URL` instead of the mock |
| `VITE_API_BASE_URL`  | empty   | Base URL of the real API, used when `VITE_API_MODE=real`                  |
| `VITE_MOCK_DELAY_MS` | 350     | Delay added to each mock request, to imitate a network                    |

## Project layout

```
src/
  api/        Request layer, endpoint functions, cache
  components/ Shared UI and the error boundary
  hooks/      Custom hooks
  mocks/      Mock API and seed data (5,000 products)
  pages/      One file per route
  store/      Redux store (cart and session)
  types/      Shared types, including the API contract
  utils/      Pure helpers and the error logger
docs/         Design notes: API contract, architecture, decisions, performance
```

Start with `docs/ARCHITECTURE.md` for how the pieces fit, and `docs/api-contract.md`
for the endpoints.

## Demo notes

- The product list has a "Simulate server error" checkbox to see the error state.
- `p1` is out of stock, so trying to check it out shows the 409 message.
- Stock and orders are stored in the browser's `localStorage`, so they persist
  across reloads. Clear site data to reset them.
- Checkout is a demo. No payment is processed.
