import { request } from './client';
import { cached, clearCache } from './cache';
import type {
  Filters,
  LoginResponse,
  Order,
  ProductsResponse,
  Product,
  User,
  CartLine,
} from '../types/api';
export const api = {
  products: (f: Filters, signal?: AbortSignal, fail = false): Promise<ProductsResponse> => {
    const q = new URLSearchParams({
      search: f.search,
      category: f.category,
      sort: f.sort,
      page: String(f.page),
      inStock: String(f.inStock),
    });
    // Simulated failures always go to the server, so they are never served from cache.
    if (fail) {
      q.set('fail', '500');
      return request(`/api/products?${q}`, { signal });
    }
    return cached(`products?${q}`, () => request(`/api/products?${q}`, { signal }));
  },
  product: (id: string, signal?: AbortSignal): Promise<Product> =>
    cached(`product:${id}`, () => request(`/api/products/${encodeURIComponent(id)}`, { signal })),
  // Always goes to the server. Used by the cart's stock sync, which must see
  // stock changes sooner than the 60-second cache would allow.
  productFresh: (id: string): Promise<Product> =>
    request(`/api/products/${encodeURIComponent(id)}`),
  login: (email: string, password: string): Promise<LoginResponse> =>
    request('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: (token: string): Promise<User> => request('/api/me', {}, token),
  checkout: async (items: CartLine[], key: string, token: string): Promise<Order> => {
    const order = await request<Order>(
      '/api/orders',
      { method: 'POST', body: JSON.stringify({ items, idempotencyKey: key }) },
      token,
    );
    // The server changed stock, so cached product data is now out of date.
    clearCache();
    return order;
  },
  order: (id: string, token: string): Promise<Order> =>
    request(`/api/orders/${encodeURIComponent(id)}`, {}, token),
};
