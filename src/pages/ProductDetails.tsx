import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/services';
import { remoteError } from '../api/client';
import { StateView } from '../components/Ui';
import { useAppDispatch } from '../hooks';
import { cartActions } from '../store';
import type { Product, Remote } from '../types/api';
import { money } from '../utils/catalog';
export function ProductDetails() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const [retry, setRetry] = useState(0);
  // Results are tagged with the request key they belong to, so a result for a
  // previous product or retry is never shown. Loading is derived from the key.
  const [result, setResult] = useState<{ key: string; state: Remote<Product> } | null>(null);
  const requestKey = `${id}:${retry}`;
  const state: Remote<Product> = result?.key === requestKey ? result.state : { status: 'loading' };
  useEffect(() => {
    const controller = new AbortController();
    api
      .product(id || '', controller.signal)
      .then((data) => setResult({ key: requestKey, state: { status: 'success', data } }))
      .catch((e) => {
        if (!controller.signal.aborted) setResult({ key: requestKey, state: remoteError(e) });
      });
    return () => controller.abort();
  }, [id, retry, requestKey]);
  return (
    <main className="container details">
      <Link to="/" className="breadcrumb">
        ← Back to products
      </Link>
      {state.status === 'loading' ? (
        <StateView title="Loading product…" />
      ) : state.status === 'error' && state.httpStatus === 404 ? (
        <StateView title="Product not found" description="It may have been removed." />
      ) : state.status === 'error' ? (
        <StateView
          title="Product unavailable"
          description={state.message}
          onRetry={state.retryable ? () => setRetry((n) => n + 1) : undefined}
        />
      ) : (
        <div className="detail-layout">
          <div className="detail-art" aria-label={`${state.data.category} illustration`}>
            {state.data.imageUrl}
          </div>
          <div className="detail-copy">
            <span className="eyebrow">{state.data.category.toUpperCase()}</span>
            <h1>{state.data.name}</h1>
            <p className="rating">★ {state.data.rating.toFixed(1)} / 5</p>
            <p className="detail-price">{money(state.data.price)}</p>
            <p className="muted">
              A little upgrade for your daily development workflow. Carefully selected for makers,
              tinkerers, and professional bug hunters.
            </p>
            <p className={state.data.stock ? 'stock' : 'sold'}>
              {state.data.stock ? `${state.data.stock} available` : 'Out of stock'}
            </p>
            <button
              className="primary-button"
              disabled={!state.data.stock}
              onClick={() => dispatch(cartActions.add(state.data))}
            >
              Add to cart
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
