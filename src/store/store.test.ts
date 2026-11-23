import { describe, expect, it } from 'vitest';
import { cartActions, store } from './index';
import type { Product } from '../types/api';

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 'p-test',
  name: 'Test Duck',
  price: 500,
  category: 'ducks',
  stock: 3,
  rating: 4,
  imageUrl: '🦆',
  ...overrides,
});

const lines = () => store.getState().cart.lines;

describe('cart reducer', () => {
  it('adds a product, then increments its quantity up to stock', () => {
    store.dispatch(cartActions.clear());
    const p = product({ stock: 2 });
    store.dispatch(cartActions.add(p));
    store.dispatch(cartActions.add(p));
    store.dispatch(cartActions.add(p));
    expect(lines()).toEqual([{ product: p, quantity: 2 }]);
  });

  it('never adds a sold-out product', () => {
    store.dispatch(cartActions.clear());
    store.dispatch(cartActions.add(product({ stock: 0 })));
    expect(lines()).toEqual([]);
  });

  it('clamps a typed quantity between 1 and stock', () => {
    store.dispatch(cartActions.clear());
    const p = product({ stock: 4 });
    store.dispatch(cartActions.add(p));
    store.dispatch(cartActions.quantity({ id: p.id, quantity: 999 }));
    expect(lines()[0].quantity).toBe(4);
    store.dispatch(cartActions.quantity({ id: p.id, quantity: 0 }));
    expect(lines()[0].quantity).toBe(1);
  });

  it('removes a line by product id', () => {
    store.dispatch(cartActions.clear());
    store.dispatch(cartActions.add(product({ id: 'a' })));
    store.dispatch(cartActions.add(product({ id: 'b' })));
    store.dispatch(cartActions.remove('a'));
    expect(lines().map((l) => l.product.id)).toEqual(['b']);
  });

  it('syncStock drops sold-out lines and lowers quantities to new stock', () => {
    store.dispatch(cartActions.clear());
    store.dispatch(cartActions.add(product({ id: 'keep', stock: 5 })));
    store.dispatch(cartActions.add(product({ id: 'gone', stock: 5 })));
    store.dispatch(cartActions.quantity({ id: 'keep', quantity: 4 }));
    store.dispatch(
      cartActions.syncStock([product({ id: 'keep', stock: 2 }), product({ id: 'gone', stock: 0 })]),
    );
    expect(lines()).toEqual([{ product: product({ id: 'keep', stock: 2 }), quantity: 2 }]);
  });
});
