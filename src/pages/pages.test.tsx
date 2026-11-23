// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, cartActions, sessionActions } from '../store';
import { Login } from './Auth';
import { Checkout } from './Checkout';
import { PRODUCTS } from '../mocks/seed';

// Product p2 has stock; p1 is sold out in the mock. Both are from the seed data.
const inStock = PRODUCTS.find((p) => p.id === 'p2')!;
const soldOut = PRODUCTS.find((p) => p.id === 'p1')!;

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="path">{location.pathname}</p>;
}

function renderAt(path: string, element: ReactNode, routes?: ReactNode) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        {routes ?? (
          <Routes>
            <Route path="*" element={element} />
          </Routes>
        )}
        <LocationProbe />
      </MemoryRouter>
    </Provider>,
  );
}

beforeEach(() => {
  store.dispatch(cartActions.clear());
  store.dispatch(sessionActions.signOut());
});
afterEach(() => cleanup());

describe('login page', () => {
  it('shows "Email or password is incorrect." for wrong credentials', async () => {
    renderAt('/login', <Login />);
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Email or password is incorrect.',
    );
    expect(store.getState().session.token).toBeNull();
  });

  it('signs in with the demo account and stores the session', async () => {
    renderAt('/login', <Login />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(store.getState().session.token).toBe('demo-token'));
    expect(store.getState().session.user?.email).toBe('demo@bugbazaar.dev');
  });
});

describe('checkout page', () => {
  const routes = (
    <Routes>
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders/:id" element={<p>order page</p>} />
    </Routes>
  );

  it('places an order, clears the cart, and opens the order page', async () => {
    store.dispatch(
      sessionActions.signIn({
        token: 'demo-token',
        user: { id: 'u1', name: 'Demo', email: 'demo@bugbazaar.dev' },
      }),
    );
    store.dispatch(cartActions.add(inStock));
    renderAt('/checkout', null, routes);
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    await waitFor(() => expect(screen.getByTestId('path').textContent).toMatch(/^\/orders\//));
    expect(store.getState().cart.lines).toEqual([]);
  });

  it('names the item that is out of stock on a 409 and offers no retry', async () => {
    store.dispatch(
      sessionActions.signIn({
        token: 'demo-token',
        user: { id: 'u1', name: 'Demo', email: 'demo@bugbazaar.dev' },
      }),
    );
    // Put a sold-out product in the cart by pretending the client still sees stock.
    store.dispatch(cartActions.add({ ...soldOut, stock: 5 }));
    renderAt('/checkout', null, routes);
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain(`${soldOut.name} is out of stock.`);
    expect(screen.queryByRole('button', { name: /try again/i })).toBeNull();
    expect(store.getState().cart.lines).toHaveLength(1);
  });

  it('reuses the same checkout key for a retry that has not succeeded', async () => {
    store.dispatch(
      sessionActions.signIn({
        token: 'demo-token',
        user: { id: 'u1', name: 'Demo', email: 'demo@bugbazaar.dev' },
      }),
    );
    store.dispatch(cartActions.add({ ...soldOut, stock: 5 }));
    renderAt('/checkout', null, routes);
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    await screen.findByRole('alert');
    const first = sessionStorage.getItem('bazaar-checkout-key');
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    await screen.findByRole('alert');
    expect(sessionStorage.getItem('bazaar-checkout-key')).toBe(first);
    expect(first).toBeTruthy();
  });
});
