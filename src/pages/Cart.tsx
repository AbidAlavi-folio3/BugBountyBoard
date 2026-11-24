import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { cartActions } from '../store';
import { cartCount, cartTotal, FREE_SHIPPING_CENTS, money, shippingFor } from '../utils/catalog';
import { StateView } from '../components/Ui';

export function Cart() {
  const lines = useAppSelector((s) => s.cart.lines);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const subtotal = cartTotal(lines);
  const shipping = shippingFor(subtotal);
  const remaining = Math.max(0, FREE_SHIPPING_CENTS - subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_CENTS) * 100));

  return (
    <main className="container page">
      <span className="eyebrow">YOUR PICKS</span>
      <h1>
        Shopping cart <span className="muted">({cartCount(lines)})</span>
      </h1>
      {lines.length === 0 ? (
        <StateView
          title="Your cart is empty"
          description="Your next favorite developer gadget is waiting."
          onRetry={() => navigate('/')}
          actionLabel="Browse products"
        />
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {lines.map(({ product, quantity }) => (
              <article className="cart-item" key={product.id}>
                <div className={`cart-art art-${product.category}`} aria-hidden="true">
                  {product.imageUrl}
                </div>
                <div className="cart-info">
                  <Link to={`/products/${product.id}`}>
                    <strong>{product.name}</strong>
                  </Link>
                  <p className="muted">{money(product.price)} each</p>
                  <button
                    className="text-button"
                    onClick={() => dispatch(cartActions.remove(product.id))}
                  >
                    Remove
                  </button>
                </div>
                <label className="qty">
                  Qty
                  <input
                    aria-label={`Quantity for ${product.name}`}
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) =>
                      dispatch(
                        cartActions.quantity({ id: product.id, quantity: Number(e.target.value) }),
                      )
                    }
                  />
                </label>
                <strong className="line-total">{money(product.price * quantity)}</strong>
              </article>
            ))}
          </div>
          <aside className="summary">
            <h2>Order summary</h2>
            <div className="shipping-meter">
              <p>
                {remaining > 0
                  ? `Add ${money(remaining)} more for free shipping`
                  : "You've unlocked free shipping"}
              </p>
              <div
                className="meter"
                role="progressbar"
                aria-label="Progress to free shipping"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : money(shipping)}</span>
            </div>
            <hr />
            <div className="summary-row total">
              <strong>Total</strong>
              <strong>{money(subtotal + shipping)}</strong>
            </div>
            <button className="primary-button full" onClick={() => navigate('/checkout')}>
              Checkout securely →
            </button>
            <p className="muted small-print">Demo store. No payment is processed.</p>
            <Link to="/" className="continue">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
