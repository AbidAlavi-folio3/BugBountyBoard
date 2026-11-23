# Glossary

Each term is defined in plain words, with an example from the store. Keep the
definitions in your own words before the walkthrough.

**Latency**
The time between asking for something and getting it back. In the store, a product
list takes about 350 ms with the mock delay. A cached revisit takes almost none,
because no request is sent.

**Idempotency**
Doing the same operation twice has the same effect as doing it once. In the store,
checkout sends an `idempotencyKey`. If the same key is sent again after an order
completes, the server returns the existing order and changes no stock.

**Horizontal scaling**
Adding more copies of a service to handle more load, instead of making one copy
bigger. In the store, the API is stateless apart from the database, so more API
servers could sit behind a load balancer. The mock keeps its data in each browser's
`localStorage`, so there is no shared server state to scale.

**CDN (content delivery network)**
A set of servers around the world that keep copies of static files, such as the
JavaScript bundle, close to users. In the store, `dist/` (the built app) could be
served from a CDN, while the API stays on its own servers.

**Cache invalidation**
Removing or refreshing cached data when the underlying data changes. In the store,
a successful order calls `clearCache()`, because stock changed on the server. The
cache is also cleared by its own 60-second expiry.

**Eventual consistency**
Data on different parts of a system may disagree for a short time, but they agree
after a while. In the store, the product list can show stock from up to 60 seconds
ago. The server is correct, and the screen catches up. Checkout always asks the
server, so an out-of-stock item still returns 409.
