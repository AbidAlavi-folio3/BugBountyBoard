# Auth

## Flow

1. `POST /api/login` with email and password. On success the server returns
   `{ token, user }`.
2. The app stores the session in Redux (`session` slice) and mirrors it to
   `sessionStorage` under `bazaar-session`.
3. Every API call that needs auth sends `Authorization: Bearer <token>`
   (see `request()` in `src/api/client.ts`).
4. Protected pages (`/account`, `/checkout`, `/orders/:id`) redirect to
   `/login` when there is no token. The original path is passed in router
   state, so after login the user returns to where they were.
5. If any authenticated call returns 401, the centralized handler signs the
   user out. The Redux session is emptied, and that empty state is saved to
   `sessionStorage`. The
   Protected route then redirects to login.

## Where the token lives, and the trade-off

The token is in `sessionStorage` (per tab, cleared when the tab closes).

- Pro: JavaScript can read it, so the app can attach it to requests. It is
  not sent automatically with every request, so it isn't exposed to CSRF.
- Con: any script running on the page can read it. A cross-site scripting bug
  would let an attacker take the session.

An httpOnly cookie avoids that read access, because scripts can't see it. The
trade-off is that the browser then sends it automatically, so the server must
guard against CSRF (SameSite cookies, or CSRF tokens). The mock API uses a
fixed demo token, so this is a teaching setup, not a production design.

## Login form

- The submit guard is a ref (`inFlight`), not state, so two fast clicks can't
  send two requests.
- 400 errors show per-field messages from `details`.
- 401 on this form means wrong credentials ("Email or password is incorrect."),
  not an expired session.
