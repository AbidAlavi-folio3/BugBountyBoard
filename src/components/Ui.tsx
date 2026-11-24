import { Component, useState, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/api';
import { money } from '../utils/catalog';
import { reportError } from '../utils/logger';
import { notify } from '../utils/toast';
import { cartActions } from '../store';
import { useAppDispatch, useBackToTop } from '../hooks';

// Five-star rating drawn with text. Screen readers hear "4.2 out of 5 stars".
export function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i + 1 <= rounded) return '★';
    return '☆';
  }).join('');
  return (
    <span className="stars" role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      <span aria-hidden="true">{stars}</span>
    </span>
  );
}

// Badges show a product's state at a glance. Sold out takes priority over low stock.
export function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="badge badge-sold">Sold out</span>;
  if (stock <= 3) return <span className="badge badge-low">Only {stock} left</span>;
  return null;
}

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const [added, setAdded] = useState(false);

  function addToCart() {
    dispatch(cartActions.add(product));
    notify(`${product.name} added to cart`);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-link">
        <div className={`product-art art-${product.category}`} aria-hidden="true">
          <span className="product-emoji">{product.imageUrl}</span>
          <StockBadge stock={product.stock} />
        </div>
        <div className="product-body">
          <span className="category">{product.category}</span>
          <h3>{product.name}</h3>
          <Stars value={product.rating} />
          <div className="product-bottom">
            <strong>{money(product.price)}</strong>
            {product.stock > 3 && <span className="stock">In stock</span>}
          </div>
        </div>
      </Link>
      <button
        className={`add-button${added ? ' is-added' : ''}`}
        disabled={!product.stock}
        onClick={addToCart}
      >
        {!product.stock ? 'Unavailable' : added ? '✓ Added' : 'Add to cart'}
      </button>
    </article>
  );
}

export function StateView({
  title,
  description,
  onRetry,
  actionLabel = 'Try again',
}: {
  title: string;
  description?: string;
  onRetry?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="state-view" role="status">
      <div className="state-emoji" aria-hidden="true">
        🛠️
      </div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {onRetry && <button onClick={onRetry}>{actionLabel}</button>}
    </div>
  );
}

export function BackToTop() {
  const visible = useBackToTop();
  return visible ? (
    <button
      className="back-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      ↑
    </button>
  ) : null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, info.componentStack ?? undefined);
  }
  render() {
    return this.state.failed ? (
      <StateView
        title="Something went wrong"
        description="Please reload the page."
        onRetry={() => window.location.reload()}
      />
    ) : (
      this.props.children
    );
  }
}
