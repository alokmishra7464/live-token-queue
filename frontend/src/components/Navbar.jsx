import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="navbar">
      <strong>Queue Token</strong>
      {user && (
        <div className="nav-right">
          <span className="phone">{user.phone}</span>
          <button className="btn small ghost" onClick={logout}>Log out</button>
        </div>
      )}
    </header>
  );
}
