import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { cartActions } from '../store';
import { cartCount, cartTotal, money } from '../utils/catalog';
import { StateView } from '../components/Ui';
export function Cart() {
  const lines = useAppSelector((s) => s.cart.lines);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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
        />
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {lines.map(({ product, quantity }) => (
              <article className="cart-item" key={product.id}>
                <div className="cart-art">{product.imageUrl}</div>
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
                <label>
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
                <strong>{money(product.price * quantity)}</strong>
              </article>
            ))}
          </div>
          <aside className="summary">
            <h2>Order summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{money(cartTotal(lines))}</strong>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <hr />
            <div className="summary-row">
              <strong>Total</strong>
              <strong>{money(cartTotal(lines))}</strong>
            </div>
            <button className="primary-button full" onClick={() => navigate('/checkout')}>
              Proceed to checkout →
            </button>
            <Link to="/" className="continue">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
