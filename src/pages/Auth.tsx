import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/services';
import { userMessage } from '../api/client';
import { useAppDispatch } from '../hooks';
import { sessionActions } from '../store';
export function Login() {
  const [email, setEmail] = useState('demo@bugbazaar.dev');
  const [password, setPassword] = useState('password123');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/account';
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    try {
      const session = await api.login(email, password);
      dispatch(sessionActions.signIn(session));
      navigate(from, { replace: true });
    } catch (err) {
      setError(userMessage(err));
    } finally {
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
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
