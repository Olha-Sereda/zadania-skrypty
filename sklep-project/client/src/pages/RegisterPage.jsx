import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, fullName);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Rejestracja nie powiodla sie');
    }
  }

  return (
    <section className="max-w-md mx-auto mt-12">
      <h1 className="text-3xl font-black mb-6">Rejestracja</h1>
      {error && <p className="text-red-700 mb-4">{error}</p>}
      {success && <p className="text-green-700 mb-4">Konto utworzone! Przekierowanie do logowania...</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Imie i nazwisko"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full border border-black/20 rounded-lg px-4 py-2"
        />
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
        <button className="w-full bg-black text-white rounded-xl py-2 font-semibold">Zarejestruj</button>
      </form>
      <p className="mt-4 text-sm text-center">
        Masz juz konto? <Link to="/login" className="underline font-medium">Zaloguj sie</Link>
      </p>
    </section>
  );
}
