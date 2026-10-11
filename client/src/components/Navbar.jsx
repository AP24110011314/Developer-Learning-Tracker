import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const doLogout = async () => {
    await logout();
    nav('/login');
  };

  return (
    <nav className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <div className="flex gap-4 items-center">
        <Link to="/" className="font-bold">DLT</Link>
        <Link to="/" className="text-sm hover:underline">Dashboard</Link>
        <Link to="/problems" className="text-sm hover:underline">Problems</Link>
        <Link to="/goals" className="text-sm hover:underline">Goals</Link>
        <Link to="/projects" className="text-sm hover:underline">Projects</Link>
      </div>
      <div className="flex gap-3 items-center text-sm">
        <span className="text-gray-600">{user?.username}</span>
        <button onClick={doLogout} className="border px-3 py-1 rounded">Log out</button>
      </div>
    </nav>
  );
}
