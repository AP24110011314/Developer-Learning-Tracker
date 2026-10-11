import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold">Developer Learning Tracker</h1>
        <p className="mt-2 text-sm text-gray-600">
          Phase 1 is working. Logged in as <strong>{user?.username}</strong> ({user?.email})
        </p>
        <button onClick={logout} className="mt-4 bg-black text-white px-4 py-2 rounded">
          Log out
        </button>
      </div>
    </div>
  );
}
