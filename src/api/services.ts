import { request } from './client';
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
    if (fail) q.set('fail', '500');
    return request(`/api/products?${q}`, { signal });
  },
  product: (id: string, signal?: AbortSignal): Promise<Product> =>
    request(`/api/products/${encodeURIComponent(id)}`, { signal }),
  login: (email: string, password: string): Promise<LoginResponse> =>
    request('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: (token: string): Promise<User> => request('/api/me', {}, token),
  checkout: (items: CartLine[], key: string, token: string): Promise<Order> =>
    request(
      '/api/orders',
      { method: 'POST', body: JSON.stringify({ items, idempotencyKey: key }) },
      token,
    ),
  order: (id: string, token: string): Promise<Order> =>
    request(`/api/orders/${encodeURIComponent(id)}`, {}, token),
};
