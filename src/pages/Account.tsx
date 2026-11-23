import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { sessionActions } from '../store';
export function Account() {
  const user = useAppSelector((s) => s.session.user);
  const dispatch = useAppDispatch();
  return (
    <main className="container page">
      <span className="eyebrow">YOUR SPACE</span>
      <h1>My account</h1>
      <div className="account-card">
        <div className="avatar">👨‍💻</div>
        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
        <button onClick={() => dispatch(sessionActions.signOut())}>Sign out</button>
        <Link to="/">Browse products</Link>
      </div>
    </main>
  );
}
