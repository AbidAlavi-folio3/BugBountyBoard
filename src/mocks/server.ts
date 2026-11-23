import type { ApiError, CartLine, Order, Product, User } from '../types/api';
import { PRODUCTS } from './seed';
import { filterProducts, PAGE_SIZE } from '../utils/catalog';
import type { Category, Sort } from '../types/api';
const DB_KEY = 'bazaar-stock-v1';
const ORDER_KEY = 'bazaar-orders-v1';
const SESSION_TOKEN = 'demo-token';
const user: User = { id: 'u1', name: 'Demo Developer', email: 'demo@bugbazaar.dev' };
const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* private browsing */
    }
  },
};
const stock: Record<string, number> = JSON.parse(storage.get(DB_KEY) || '{}') as Record<
  string,
  number
>;
const orders: Record<string, Order> = JSON.parse(storage.get(ORDER_KEY) || '{}') as Record<
  string,
  Order
>;
function withStock(p: Product): Product {
  return { ...p, stock: stock[p.id] ?? p.stock };
}
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
function error(
  status: number,
  code: string,
  message: string,
  details?: Record<string, string>,
): Response {
  const payload: ApiError = { error: { code, message, ...(details ? { details } : {}) } };
  return json(payload, status);
}
function authorized(req: Request): boolean {
  return req.headers.get('Authorization') === `Bearer ${SESSION_TOKEN}`;
}
function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const t = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    function abort() {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    }
    signal.addEventListener('abort', abort, { once: true });
  });
}
export async function mockFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const req = new Request(new URL(input, window.location.origin), init);
  const url = new URL(req.url);
  const delay =
    import.meta.env.MODE === 'test' ? 0 : Number(import.meta.env.VITE_MOCK_DELAY_MS ?? 350);
  await wait(url.searchParams.get('slow') === '1' ? 1700 : Math.max(0, delay), req.signal);
  if (url.searchParams.get('fail') === '500')
    return error(500, 'SERVER_ERROR', 'Simulated server failure');
  if (url.pathname === '/api/products' && req.method === 'GET') {
    const search = url.searchParams.get('search') || '';
    const category = (url.searchParams.get('category') || '') as Category | '';
    const sort = (url.searchParams.get('sort') || 'featured') as Sort;
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const inStock = url.searchParams.get('inStock') === 'true';
    const matches = filterProducts(PRODUCTS.map(withStock), {
      search,
      category,
      sort,
      page,
      inStock,
    });
    return json({
      items: matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
      total: matches.length,
    });
  }
  const productMatch = url.pathname.match(/^\/api\/products\/(.+)$/);
  if (productMatch && req.method === 'GET') {
    const p = PRODUCTS.find((p) => p.id === productMatch[1]);
    return p ? json(withStock(p)) : error(404, 'NOT_FOUND', 'Product not found');
  }
  if (url.pathname === '/api/login' && req.method === 'POST') {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return error(400, 'VALIDATION', 'Invalid JSON');
    }
    if (
      !body ||
      typeof body !== 'object' ||
      !('email' in body) ||
      !('password' in body) ||
      typeof body.email !== 'string' ||
      typeof body.password !== 'string' ||
      !body.email ||
      !body.password
    )
      return error(400, 'VALIDATION', 'Email and password required', {
        email: 'Email is required',
        password: 'Password is required',
      });
    if (body.email !== user.email || body.password !== 'password123')
      return error(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    return json({ token: SESSION_TOKEN, user });
  }
  if (url.pathname === '/api/me' && req.method === 'GET')
    return authorized(req) ? json(user) : error(401, 'UNAUTHORIZED', 'Sign in required');
  if (url.pathname === '/api/orders' && req.method === 'POST') {
    if (!authorized(req)) return error(401, 'UNAUTHORIZED', 'Sign in required');
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return error(400, 'VALIDATION', 'Invalid JSON');
    }
    if (
      !body ||
      typeof body !== 'object' ||
      !('items' in body) ||
      !Array.isArray(body.items) ||
      body.items.length === 0 ||
      !('idempotencyKey' in body) ||
      typeof body.idempotencyKey !== 'string' ||
      !body.idempotencyKey
    )
      return error(400, 'VALIDATION', 'Items and idempotencyKey required');
    const key = body.idempotencyKey;
    if (orders[key]) return json(orders[key], 201);
    const lines = body.items as CartLine[];
    for (const line of lines) {
      if (
        !line ||
        typeof line !== 'object' ||
        !line.product ||
        typeof line.product.id !== 'string' ||
        !Number.isInteger(line.quantity) ||
        line.quantity < 1
      )
        return error(400, 'VALIDATION', 'Invalid cart item');
      const p = PRODUCTS.find((p) => p.id === line.product.id);
      if (!p) return error(400, 'VALIDATION', 'Invalid product');
      if (withStock(p).stock < line.quantity)
        return error(409, 'OUT_OF_STOCK', `${p.name} has insufficient stock`, {
          productId: p.id,
          productName: p.name,
        });
    }
    for (const line of lines) {
      const p = PRODUCTS.find((p) => p.id === line.product.id);
      if (p) stock[p.id] = withStock(p).stock - line.quantity;
    }
    storage.set(DB_KEY, JSON.stringify(stock));
    const order: Order = { id: `order-${Object.keys(orders).length + 1}`, status: 'queued' };
    orders[key] = order;
    storage.set(ORDER_KEY, JSON.stringify(orders));
    return json(order, 201);
  }
  const orderMatch = url.pathname.match(/^\/api\/orders\/(.+)$/);
  if (orderMatch && req.method === 'GET') {
    if (!authorized(req)) return error(401, 'UNAUTHORIZED', 'Sign in required');
    const order = Object.values(orders).find((o) => o.id === orderMatch[1]);
    return order ? json(order) : error(404, 'NOT_FOUND', 'Order not found');
  }
  return error(404, 'NOT_FOUND', 'Endpoint not found');
}
