import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/services';
import { userMessage } from '../api/client';
import { cartActions } from '../store';
import { useAppDispatch, useAppSelector } from '../hooks';
import { cartTotal, money } from '../utils/catalog';
import { StateView } from '../components/Ui';
export function Checkout() {
  const lines = useAppSelector((s) => s.cart.lines);
  const token = useAppSelector((s) => s.session.token);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const key = useRef(crypto.randomUUID());
  const busy = useRef(false);
  async function place() {
    if (!token || !lines.length || busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    try {
      const order = await api.checkout(lines, key.current, token);
      dispatch(cartActions.clear());
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (e) {
      setError(userMessage(e));
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
          <hr />
          <div className="summary-row">
            <strong>Total</strong>
            <strong>{money(cartTotal(lines))}</strong>
          </div>
          {error && (
            <p role="alert" className="form-error">
              {error} <Link to="/cart">Review cart</Link>
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
