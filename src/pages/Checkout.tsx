import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/services';
import { remoteError } from '../api/client';
import { cartActions } from '../store';
import { useAppDispatch, useAppSelector } from '../hooks';
import { cartTotal, money, shippingFor } from '../utils/catalog';
import { StateView } from '../components/Ui';

// One key per checkout attempt. It is kept in sessionStorage, not in component
// state, so a reload during checkout retries with the same key. The server
// returns the existing order for a key it has already completed, so a retry
// can't create a second order. The key is cleared only after success.
const CHECKOUT_KEY = 'bazaar-checkout-key';
function checkoutKey(): string {
  try {
    const existing = sessionStorage.getItem(CHECKOUT_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    sessionStorage.setItem(CHECKOUT_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID(); // storage disabled: fall back to a per-click key
  }
}
function clearCheckoutKey(): void {
  try {
    sessionStorage.removeItem(CHECKOUT_KEY);
  } catch {
    /* storage disabled */
  }
}

export function Checkout() {
  const lines = useAppSelector((s) => s.cart.lines);
  const token = useAppSelector((s) => s.session.token);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [retryable, setRetryable] = useState(false);
  const busy = useRef(false);
  async function place() {
    if (!token || !lines.length || busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    setRetryable(false);
    try {
      const order = await api.checkout(lines, checkoutKey(), token);
      clearCheckoutKey();
      dispatch(cartActions.clear());
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (e) {
      const failure = remoteError(e);
      setError(failure.message);
      setRetryable(failure.retryable);
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <main className="container page">
      <span className="eyebrow">ONE LAST STEP</span>
      <h1>Checkout</h1>
      {!lines.length ? (
        <StateView
          title="Nothing to check out"
          description="Add products before placing an order."
          onRetry={() => navigate('/')}
        />
      ) : (
        <div className="checkout-panel">
          <h2>Review your order</h2>
          {lines.map((l) => (
            <div className="summary-row" key={l.product.id}>
              <span>
                {l.product.name} × {l.quantity}
              </span>
              <strong>{money(l.product.price * l.quantity)}</strong>
            </div>
          ))}
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{money(cartTotal(lines))}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>
              {shippingFor(cartTotal(lines)) === 0 ? 'Free' : money(shippingFor(cartTotal(lines)))}
            </span>
          </div>
          <hr />
          <div className="summary-row total">
            <strong>Total</strong>
            <strong>{money(cartTotal(lines) + shippingFor(cartTotal(lines)))}</strong>
          </div>
          {error && (
            <p role="alert" className="form-error">
              {error} <Link to="/cart">Review cart</Link>
              {retryable && (
                <>
                  {' '}
                  <button type="button" className="text-button" onClick={place}>
                    Try again
                  </button>
                </>
              )}
            </p>
          )}
          <button className="primary-button full" disabled={pending} onClick={place}>
            {pending ? 'Placing order…' : 'Place order →'}
          </button>
          <p className="muted">Demo checkout only. No real payment is processed.</p>
        </div>
      )}
    </main>
  );
}
