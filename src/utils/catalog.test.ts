import { describe, expect, it } from 'vitest';
import { cartCount, cartTotal, filterProducts, money, PAGE_SIZE } from './catalog';
import { PRODUCTS } from '../mocks/seed';
import type { Filters, CartLine } from '../types/api';
const base: Filters = { search: '', category: '', sort: 'featured', page: 1, inStock: false };
const lines: CartLine[] = [
  { product: PRODUCTS[1], quantity: 2 },
  { product: PRODUCTS[2], quantity: 3 },
];
describe('catalog behavior', () => {
  it('seeds 5000 products', () => expect(PRODUCTS).toHaveLength(5000));
  it('uses unique ids', () => expect(new Set(PRODUCTS.map((p) => p.id)).size).toBe(5000));
  it('formats cents as dollars', () => expect(money(1299)).toBe('$12.99'));
  it('formats zero', () => expect(money(0)).toBe('$0.00'));
  it('has 24 items per page', () => expect(PAGE_SIZE).toBe(24));
  it('search is case insensitive', () =>
    expect(filterProducts(PRODUCTS, { ...base, search: 'MECHANICAL' }).length).toBeGreaterThan(0));
  it('search can return empty', () =>
    expect(filterProducts(PRODUCTS, { ...base, search: 'zzzz-no-product' })).toEqual([]));
  it('filters by category', () =>
    expect(
      filterProducts(PRODUCTS, { ...base, category: 'ducks' }).every((p) => p.category === 'ducks'),
    ).toBe(true));
  it('filters in-stock', () =>
    expect(filterProducts(PRODUCTS, { ...base, inStock: true }).every((p) => p.stock > 0)).toBe(
      true,
    ));
  it('sorts prices ascending', () => {
    const p = filterProducts(PRODUCTS, { ...base, sort: 'price-asc' });
    expect(p[0].price).toBeLessThanOrEqual(p[1].price);
  });
  it('sorts prices descending', () => {
    const p = filterProducts(PRODUCTS, { ...base, sort: 'price-desc' });
    expect(p[0].price).toBeGreaterThanOrEqual(p[1].price);
  });
  it('sorts by rating', () => {
    const p = filterProducts(PRODUCTS, { ...base, sort: 'rating' });
    expect(p[0].rating).toBeGreaterThanOrEqual(p[1].rating);
  });
  it('counts cart quantity', () => expect(cartCount(lines)).toBe(5));
  it('calculates cart total in cents', () =>
    expect(cartTotal(lines)).toBe(PRODUCTS[1].price * 2 + PRODUCTS[2].price * 3));
  it('empty cart count is zero', () => expect(cartCount([])).toBe(0));
  it('empty cart total is zero', () => expect(cartTotal([])).toBe(0));
  it('combined category and search works', () =>
    expect(
      filterProducts(PRODUCTS, { ...base, category: 'coffee', search: 'espresso' }).every(
        (p) => p.category === 'coffee' && p.name.toLowerCase().includes('espresso'),
      ),
    ).toBe(true));
});
