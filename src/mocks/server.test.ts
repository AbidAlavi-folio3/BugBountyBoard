import { beforeAll, describe, expect, it } from 'vitest';
import { mockFetch } from './server';

beforeAll(() => {
  Object.defineProperty(globalThis, 'window', {
    value: { location: { origin: 'http://localhost:5173' } },
    configurable: true,
  });
});

const read = async (r: Response): Promise<unknown> => r.json() as Promise<unknown>;
const auth = { Authorization: 'Bearer demo-token' };
const post = (body: unknown, headers: Record<string, string> = {}) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

describe('shared mock API contract', () => {
  it('returns paginated products', async () => {
    const response = await mockFetch('/api/products?page=1');
    expect(response.status).toBe(200);
    expect(((await read(response)) as { items: unknown[]; total: number }).items).toHaveLength(24);
  });
  it('returns a product', async () => {
    expect(((await read(await mockFetch('/api/products/p2'))) as { id: string }).id).toBe('p2');
  });
  it('returns 404 for missing product', async () => {
    expect((await mockFetch('/api/products/missing')).status).toBe(404);
  });
  it('simulates 500', async () => {
    expect((await mockFetch('/api/products?fail=500')).status).toBe(500);
  });
  it('rejects invalid login body with 400', async () => {
    expect((await mockFetch('/api/login', post({}))).status).toBe(400);
  });
  it('rejects wrong credentials with 401', async () => {
    expect(
      (await mockFetch('/api/login', post({ email: 'wrong', password: 'wrong' }))).status,
    ).toBe(401);
  });
  it('logs in with demo credentials', async () => {
    expect(
      (
        await mockFetch(
          '/api/login',
          post({ email: 'demo@bugbazaar.dev', password: 'password123' }),
        )
      ).status,
    ).toBe(200);
  });
  it('protects /api/me', async () => {
    expect((await mockFetch('/api/me')).status).toBe(401);
    expect((await mockFetch('/api/me', { headers: auth })).status).toBe(200);
  });
  it('requires login for checkout', async () => {
    expect(
      (await mockFetch('/api/orders', post({ items: [], idempotencyKey: 'test' }))).status,
    ).toBe(401);
  });
  it('rejects empty cart with 400', async () => {
    expect(
      (await mockFetch('/api/orders', post({ items: [], idempotencyKey: 'test' }, auth))).status,
    ).toBe(400);
  });
  it('returns 409 when stock is zero', async () => {
    const p = (await read(await mockFetch('/api/products/p1'))) as { id: string; stock: number };
    expect(p.stock).toBe(0);
    expect(
      (
        await mockFetch(
          '/api/orders',
          post({ items: [{ product: p, quantity: 1 }], idempotencyKey: 'stock-error' }, auth),
        )
      ).status,
    ).toBe(409);
  });
  it('creates an order and deduplicates retry', async () => {
    const p = (await read(await mockFetch('/api/products/p2'))) as { id: string; stock: number };
    const payload = { items: [{ product: p, quantity: 1 }], idempotencyKey: 'repeat-order-test' };
    const first = await mockFetch('/api/orders', post(payload, auth));
    const second = await mockFetch('/api/orders', post(payload, auth));
    expect(first.status).toBe(201);
    expect(await read(first)).toEqual(await read(second));
  });
  it('retrieves an existing order', async () => {
    expect((await mockFetch('/api/orders/order-1', { headers: auth })).status).toBe(200);
  });
  it('returns 404 for missing order', async () => {
    expect((await mockFetch('/api/orders/not-real', { headers: auth })).status).toBe(404);
  });
});
