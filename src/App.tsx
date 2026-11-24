import { useEffect, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { onUnauthorized } from './api/client';
import { api } from './api/services';
import { BackToTop, ErrorBoundary, StateView } from './components/Ui';
import { Toaster } from './components/Toaster';
import { useAppDispatch, useAppSelector } from './hooks';
import { Account } from './pages/Account';
import { Login } from './pages/Auth';
import { Cart } from './pages/Cart';
import { Catalog } from './pages/Catalog';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { ProductDetails } from './pages/ProductDetails';
import { cartActions, sessionActions } from './store';
import { cartCount } from './utils/catalog';
function Protected({ children }: { children: ReactNode }) {
  const token = useAppSelector((s) => s.session.token);
  const location = useLocation();
  return token ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
function Header() {
  const lines = useAppSelector((s) => s.cart.lines);
  const user = useAppSelector((s) => s.session.user);
  const count = cartCount(lines);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden="true">{`</>`}</span> The Bug <span>Bazaar</span>
          <span className="logo-dot">.</span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            Shop
          </NavLink>
          <NavLink to="/cart" className="cart-link">
            Cart
            {/* The key restarts the bump animation each time the count changes. */}
            <span key={count} className="cart-badge">
              {count}
            </span>
          </NavLink>
          <NavLink to={user ? '/account' : '/login'}>{user ? 'Account' : 'Sign in'}</NavLink>
        </nav>
      </div>
    </header>
  );
}
export default function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const token = useAppSelector((s) => s.session.token);
  useEffect(() => {
    onUnauthorized(() => dispatch(sessionActions.signOut()));
  }, [dispatch]);
  useEffect(() => {
    if (!token) return;
    api.me(token).catch(() => {
      /* centralized 401 handler signs out */
    });
  }, [token]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      const lines = JSON.parse(localStorage.getItem('bazaar-cart') || '[]') as {
        product: { id: string };
      }[];
      if (!lines.length) return;
      Promise.all(lines.map((l) => api.productFresh(l.product.id)))
        .then((products) => dispatch(cartActions.syncStock(products)))
        .catch(() => {
          /* retry on next poll */
        });
    }, 15000);
    return () => window.clearInterval(timer);
  }, [dispatch]);
  return (
    <ErrorBoundary>
      <Header />
      {/* Keying by path replays the enter animation on every page change. */}
      <div key={location.pathname} className="route-view">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/account"
            element={
              <Protected>
                <Account />
              </Protected>
            }
          />
          <Route
            path="/checkout"
            element={
              <Protected>
                <Checkout />
              </Protected>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <Protected>
                <OrderConfirmation />
              </Protected>
            }
          />
          <Route
            path="*"
            element={
              <main className="container page">
                <StateView title="Page not found" description="That route doesn't exist." />
                <Link to="/">Go home</Link>
              </main>
            }
          />
        </Routes>
      </div>
      <BackToTop />
      <Toaster />
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <strong className="footer-brand">The Bug Bazaar.</strong>
            <p className="muted">
              Developer gear for people who keep shipping. Demo store, no real payments.
            </p>
          </div>
          <div>
            <h2 className="footer-heading">Shop</h2>
            <p>Keyboards</p>
            <p>Rubber ducks</p>
            <p>Coffee</p>
            <p>Stickers</p>
          </div>
          <div>
            <h2 className="footer-heading">Help</h2>
            <p>Free shipping on orders over $50</p>
            <p>Sign in with the demo account</p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 The Bug Bazaar</span>
          <span aria-hidden="true">⌨️ 🦆 ☕</span>
        </div>
      </footer>
    </ErrorBoundary>
  );
}
