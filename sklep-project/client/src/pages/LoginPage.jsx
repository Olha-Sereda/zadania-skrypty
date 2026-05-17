import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Logowanie nie powiodlo sie');
    }
  }

  return (
    <section className="max-w-md mx-auto mt-12">
      <h1 className="text-3xl font-black mb-6">Logowanie</h1>
      {error && <p className="text-red-700 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-black/20 rounded-lg px-4 py-2"
        />
        <input
          type="password"
          placeholder="Haslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-black/20 rounded-lg px-4 py-2"
        />
        <button className="w-full bg-black text-white rounded-xl py-2 font-semibold">Zaloguj</button>
      </form>
      <p className="mt-4 text-sm text-center">
        Nie masz konta? <Link to="/register" className="underline font-medium">Zarejestruj sie</Link>
      </p>
    </section>
  );
}
