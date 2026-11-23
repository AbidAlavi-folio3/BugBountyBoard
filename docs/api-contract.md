# API contract

The app talks to the API only through `request()` in `src/api/client.ts`. The
types are in `src/types/api.ts`. In development, requests go to the mock in
`src/mocks/server.ts`. Setting `VITE_API_MODE=real` sends them to
`VITE_API_BASE_URL` instead.

Prices are integers in cents. `$4.99` is `499`.

## Types

```ts
type Product = {
  id: string;
  name: string;
  price: number; // cents
  category: 'keyboards' | 'ducks' | 'coffee' | 'stickers';
  stock: number;
  rating: number;
  imageUrl: string;
};
type ApiError = { error: { code: string; message: string; details?: Record<string, string> } };
type User = { id: string; name: string; email: string };
type LoginResponse = { token: string; user: User };
type Order = { id: string; status: 'queued' };
type CartLine = { product: Product; quantity: number };
```

## Endpoints

| Method | Endpoint                                               | Success                                                | Errors                                                                                                      |
| ------ | ------------------------------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| GET    | `/api/products?search=&category=&sort=&page=&inStock=` | 200 `{ items: Product[], total: number }`, 24 per page | 500 (`?fail=500`)                                                                                           |
| GET    | `/api/products/:id`                                    | 200 `Product`                                          | 404 `NOT_FOUND`                                                                                             |
| POST   | `/api/login`                                           | 200 `{ token, user }`                                  | 400 `VALIDATION` with per-field `details`, 401 `INVALID_CREDENTIALS`                                        |
| GET    | `/api/me`                                              | 200 `User`                                             | 401 `UNAUTHORIZED`                                                                                          |
| POST   | `/api/orders`                                          | 201 `Order` (`status: 'queued'`)                       | 400 `VALIDATION`, 401 `UNAUTHORIZED`, 409 `OUT_OF_STOCK` with `details.productId` and `details.productName` |
| GET    | `/api/orders/:id`                                      | 200 `Order`                                            | 401 `UNAUTHORIZED`, 404 `NOT_FOUND`                                                                         |

Any other path returns 404 `NOT_FOUND`.

## Behaviour that matters

- **Search and filters:** `search` matches product names case-insensitively.
  `category` and `inStock` are optional. `sort` is `featured`, `price-asc`,
  `price-desc`, or `rating`. `page` starts at 1.
- **Login:** the demo account is `demo@bugbazaar.dev` / `password123`. Both fields
  are required, and a missing one returns 400 with a per-field message.
- **Auth header:** protected endpoints need `Authorization: Bearer demo-token`.
- **Checkout idempotency:** the request body has `idempotencyKey`. If a key has
  already completed, the server returns the stored order again and creates
  nothing new.
- **Stock:** checkout checks every line before it changes any stock. If one line
  is short, the request fails with 409 and nothing is decremented.
- **Mock data:** 5,000 products. Stock is stored in `localStorage` under
  `bazaar-stock-v1`, and orders under `bazaar-orders-v1`. Product `p1` starts out
  of stock.

## Errors in the app

Each error is mapped by `remoteError()` in `src/api/client.ts`:

| Status          | Shown to the user                                                        |
| --------------- | ------------------------------------------------------------------------ |
| 400             | "Please check the information you entered." (login shows field messages) |
| 401             | "Please sign in again." (on login: "Email or password is incorrect.")    |
| 404             | "We could not find that item." (and a Not Found screen)                  |
| 409             | "`<product>` is out of stock."                                           |
| 500             | "Service unavailable. Please retry." with a retry button                 |
| Network failure | "Could not connect. Please retry." with a retry button                   |

Raw error codes and server messages are never shown.

## Differences from the PDF contract

- The PDF's 500 applies to the product list, and the mock simulates it there with
  `?fail=500`. Orders don't simulate 500 in the mock.
- `POST /api/orders` returns 201 on first success, and 201 again for a repeated
  key. The PDF lists 200 for the repeat.
