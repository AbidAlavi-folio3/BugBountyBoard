import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/services';
import { remoteError } from '../api/client';
import { useAppSelector } from '../hooks';
import { StateView } from '../components/Ui';
import type { Order, Remote } from '../types/api';
export function OrderConfirmation() {
  const { id } = useParams();
  const token = useAppSelector((s) => s.session.token);
  const [state, setState] = useState<Remote<Order>>({ status: 'loading' });
  useEffect(() => {
    if (!token) return;
    api
      .order(id || '', token)
      .then((data) => setState({ status: 'success', data }))
      .catch((e) => setState(remoteError(e)));
  }, [id, token]);
  return (
    <main className="container page confirmation">
      {state.status === 'loading' ? (
        <StateView title="Loading your order…" />
      ) : state.status === 'error' ? (
        state.httpStatus === 404 ? (
          <StateView title="Order not found" description="Check the link and try again." />
        ) : (
          <StateView title="Order unavailable" description={state.message} />
        )
      ) : (
        <>
          <div className="success-icon">✓</div>
          <span className="eyebrow">ORDER PLACED</span>
          <h1>Nice! Your order is queued.</h1>
          <p>
            Your order <strong>{state.data.id}</strong> is being processed.
          </p>
          <p className="muted">Status: {state.data.status}</p>
          <Link to="/" className="primary-button">
            Back to shopping
          </Link>
        </>
      )}
    </main>
  );
}
