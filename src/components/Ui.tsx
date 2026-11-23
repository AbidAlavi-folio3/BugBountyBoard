import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/api';
import { money } from '../utils/catalog';
import { reportError } from '../utils/logger';
import { cartActions } from '../store';
import { useAppDispatch, useBackToTop } from '../hooks';
export function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-link">
        <div className="product-art" aria-hidden="true">
          {product.imageUrl}
        </div>
        <div className="product-body">
          <span className="category">{product.category}</span>
          <h3>{product.name}</h3>
          <span className="rating">★ {product.rating.toFixed(1)}</span>
          <div className="product-bottom">
            <strong>{money(product.price)}</strong>
            <span className={product.stock ? 'stock' : 'sold'}>
              {product.stock ? `${product.stock} in stock` : 'Sold out'}
            </span>
          </div>
        </div>
      </Link>
      <button
        className="add-button"
        disabled={!product.stock}
        onClick={() => dispatch(cartActions.add(product))}
      >
        {product.stock ? 'Add to cart' : 'Unavailable'}
      </button>
    </article>
  );
}
export function StateView({
  title,
  description,
  onRetry,
}: {
  title: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state-view" role="status">
      <div className="state-emoji">🛠️</div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {onRetry && <button onClick={onRetry}>Try again</button>}
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
