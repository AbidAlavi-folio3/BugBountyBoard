import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/services';
import { userMessage } from '../api/client';
import { ProductCard, StateView } from '../components/Ui';
import { useDebounced } from '../hooks';
import type { Category, Filters, ProductsResponse, Remote, Sort } from '../types/api';
import { PAGE_SIZE } from '../utils/catalog';
const categories: Category[] = ['keyboards', 'ducks', 'coffee', 'stickers'];
// Builds the query string for a set of filters. Defaults are left out of the URL.
function buildParams(next: Filters): URLSearchParams {
  const q = new URLSearchParams();
  if (next.search) q.set('search', next.search);
  if (next.category) q.set('category', next.category);
  if (next.sort !== 'featured') q.set('sort', next.sort);
  if (next.inStock) q.set('inStock', 'true');
  if (next.page !== 1) q.set('page', String(next.page));
  return q;
}
export function Catalog() {
  const [params, setParams] = useSearchParams();
  const filters: Filters = useMemo(
    () => ({
      search: params.get('search') || '',
      category: categories.includes(params.get('category') as Category)
        ? (params.get('category') as Category)
        : '',
      sort: (['featured', 'price-asc', 'price-desc', 'rating'].includes(params.get('sort') || '')
        ? params.get('sort')
        : 'featured') as Sort,
      page: Math.max(1, Number(params.get('page') || 1)),
      inStock: params.get('inStock') === 'true',
    }),
    [params],
  );
  const [input, setInput] = useState(filters.search);
  // Keep the search box in sync when the URL changes (e.g. Back button).
  // Adjusting state during render avoids an extra effect pass.
  const [syncedSearch, setSyncedSearch] = useState(filters.search);
  if (syncedSearch !== filters.search) {
    setSyncedSearch(filters.search);
    setInput(filters.search);
  }
  const debounced = useDebounced(input);
  // Results are stored with the request key they belong to. Any result for an
  // older key is ignored, so the loading state is derived instead of set in an effect.
  const [retry, setRetry] = useState(0);
  const [simulateError, setSimulateError] = useState(false);
  const [result, setResult] = useState<{ key: string; state: Remote<ProductsResponse> } | null>(
    null,
  );
  const seq = useRef(0);
  const requestKey = JSON.stringify([filters, retry, simulateError]);
  const state: Remote<ProductsResponse> =
    result?.key === requestKey ? result.state : { status: 'loading' };
  const update = (changes: Partial<Filters>) => setParams(buildParams({ ...filters, ...changes }));
  useEffect(() => {
    if (debounced !== filters.search)
      setParams(buildParams({ ...filters, search: debounced, page: 1 }));
  }, [debounced, filters, setParams]);
  useEffect(() => {
    const controller = new AbortController();
    const id = ++seq.current;
    api
      .products(filters, controller.signal, simulateError)
      .then((data) => {
        if (id === seq.current) setResult({ key: requestKey, state: { status: 'success', data } });
      })
      .catch((e) => {
        if (!controller.signal.aborted && id === seq.current)
          setResult({ key: requestKey, state: { status: 'error', message: userMessage(e) } });
      });
    return () => controller.abort();
  }, [filters, retry, simulateError, requestKey]);
  const total = state.status === 'success' ? state.data.total : 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <main className="container">
      <section className="hero">
        <div>
          <span className="eyebrow">FOR DEVELOPERS, BY DEVELOPERS</span>
          <h1>
            Gear for the <em>debugging</em> life.
          </h1>
          <p>
            From mechanical keyboards to your trusty rubber duck. Everything you need to ship better
            code.
          </p>
          <a href="#products" className="primary-button">
            Explore the collection ↓
          </a>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <span>⌨️</span>
          <span>🦆</span>
          <span>☕</span>
        </div>
      </section>
      <section id="products" className="browse">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE COLLECTION</span>
            <h2>Find your next favorite thing.</h2>
          </div>
          <span className="results">
            {state.status === 'success'
              ? `${total.toLocaleString()} products`
              : 'Browsing 5,000 products'}
          </span>
        </div>
        <div className="filters">
          <label className="search-label">
            Search products
            <input
              type="search"
              placeholder="Search developer gear…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </label>
          <label>
            Category
            <select
              value={filters.category}
              onChange={(e) => update({ category: e.target.value as Category | '', page: 1 })}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c[0].toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sort by
            <select
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as Sort, page: 1 })}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => update({ inStock: e.target.checked, page: 1 })}
            />{' '}
            In stock only
          </label>
          <button
            className="text-button"
            onClick={() => {
              setInput('');
              setParams(new URLSearchParams());
            }}
          >
            Clear filters
          </button>
        </div>
        <div className="debug-tools">
          <label>
            <input
              type="checkbox"
              checked={simulateError}
              onChange={(e) => setSimulateError(e.target.checked)}
            />{' '}
            Simulate server error (500)
          </label>
        </div>
        {state.status === 'loading' ? (
          <div className="skeleton-grid" aria-label="Loading products">
            {Array.from({ length: 8 }, (_, i) => (
              <div className="skeleton" key={i} />
            ))}
          </div>
        ) : state.status === 'error' ? (
          <StateView
            title="Products could not load"
            description={state.message}
            onRetry={() => setRetry((x) => x + 1)}
          />
        ) : state.data.items.length === 0 ? (
          <StateView
            title="No matching products"
            description="Try a different search or clear your filters."
            onRetry={() => {
              setInput('');
              setParams(new URLSearchParams());
            }}
          />
        ) : (
          <>
            <div className="product-grid">
              {state.data.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="pagination">
              <button
                disabled={filters.page <= 1}
                onClick={() => update({ page: filters.page - 1 })}
              >
                ← Previous
              </button>
              <span>
                Page {filters.page} of {pages}
              </span>
              <button
                disabled={filters.page >= pages}
                onClick={() => update({ page: filters.page + 1 })}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
