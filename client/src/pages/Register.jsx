import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      nav('/', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      const details = data?.errors
        ? Object.values(data.errors).flat().filter((m) => typeof m === 'string').join('; ')
        : '';
      setError(details || data?.message || 'Register failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4">
        <h1 className="text-xl font-bold">Register</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          className="w-full border p-2 rounded"
          placeholder="Username (letters, numbers, _ only)"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Password (min 8 chars)"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="w-full bg-black text-white p-2 rounded" type="submit">
          Register
        </button>
        <p className="text-sm">
          Have an account? <Link className="underline" to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
