import { useEffect, useState } from 'react';
import { subscribeToasts, type Toast } from '../utils/toast';

const DURATION_MS = 2600;

// Renders short messages in a live region, so screen readers announce them politely.
export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(
    () =>
      subscribeToasts((toast) => {
        setToasts((current) => [...current.slice(-2), toast]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((t) => t.id !== toast.id));
        }, DURATION_MS);
      }),
    [],
  );

  return (
    <div className="toaster" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div className="toast" key={toast.id}>
          <span className="toast-icon" aria-hidden="true">
            ✓
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
