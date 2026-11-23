import { useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/services';
import { HttpError, userMessage } from '../api/client';
import { useAppDispatch } from '../hooks';
import { sessionActions } from '../store';
export function Login() {
  const [email, setEmail] = useState('demo@bugbazaar.dev');
  const [password, setPassword] = useState('password123');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // A ref, not state: two fast clicks can both run before React re-renders.
  const inFlight = useRef(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/account';
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError('');
    setFieldErrors({});
    try {
      const session = await api.login(email, password);
      dispatch(sessionActions.signIn(session));
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof HttpError && err.status === 400) {
        setFieldErrors(err.details ?? {});
        setError('Please fix the highlighted fields.');
      } else if (err instanceof HttpError && err.status === 401) {
        // On the login form a 401 means wrong credentials, not an expired session.
        setError('Email or password is incorrect.');
      } else {
        setError(userMessage(err));
      }
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }
  return (
    <main className="container page auth">
      <div className="auth-panel">
        <span className="eyebrow">WELCOME BACK</span>
        <h1>Sign in</h1>
        <p className="muted">Use the demo credentials to explore checkout.</p>
        <form onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email && (
              <span id="email-error" className="field-error">
                {fieldErrors.email}
              </span>
            )}
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password && (
              <span id="password-error" className="field-error">
                {fieldErrors.password}
              </span>
            )}
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary-button full" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>
        <p className="demo-hint">Demo: demo@bugbazaar.dev / password123</p>
      </div>
    </main>
  );
}
