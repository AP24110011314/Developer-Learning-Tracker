import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold">Developer Learning Tracker</h1>
        <p className="mt-2 text-sm text-gray-600">
          Logged in as <strong>{user?.username}</strong> ({user?.email})
        </p>
        <Link to="/problems" className="inline-block mt-4 bg-black text-white px-4 py-2 rounded">
          Go to Problems
        </Link>
      </div>
      </div>
    </div>
  );
}
