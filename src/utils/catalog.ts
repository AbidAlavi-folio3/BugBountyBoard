import type { CartLine, Filters, Product } from '../types/api';
export const money = (cents: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
export const cartCount = (lines: CartLine[]): number =>
  lines.reduce((sum, l) => sum + l.quantity, 0);
export const cartTotal = (lines: CartLine[]): number =>
  lines.reduce((sum, l) => sum + l.quantity * l.product.price, 0);
export function filterProducts(products: Product[], filters: Filters): Product[] {
  const q = filters.search.trim().toLowerCase();
  const matches = products.filter(
    (p) =>
      (!q || p.name.toLowerCase().includes(q)) &&
      (!filters.category || p.category === filters.category) &&
      (!filters.inStock || p.stock > 0),
  );
  switch (filters.sort) {
    case 'price-asc':
      return matches.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return matches.sort((a, b) => b.price - a.price);
    case 'rating':
      return matches.sort((a, b) => b.rating - a.rating);
    default:
      return matches;
  }
}
export const PAGE_SIZE = 24;

// Free shipping at $50 (5000 cents). Below that, a flat $5.99 shipping fee.
export const FREE_SHIPPING_CENTS = 5000;
export const FLAT_SHIPPING_CENTS = 599;
export const shippingFor = (subtotal: number): number =>
  subtotal === 0 || subtotal >= FREE_SHIPPING_CENTS ? 0 : FLAT_SHIPPING_CENTS;
