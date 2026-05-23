import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Logowanie nie powiodlo sie");
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
          className="w-full border border-[#ED9B40]/40 rounded-lg px-4 py-2 bg-white"
        />
        <input
          type="password"
          placeholder="Haslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-[#ED9B40]/40 rounded-lg px-4 py-2 bg-white"
        />
        <button className="w-full bg-[#ED9B40] text-black rounded-xl py-2 font-semibold hover:bg-[#d88a35]">
          Zaloguj
        </button>
      </form>
      <p className="mt-4 text-sm text-center">
        Nie masz konta?{" "}
        <Link to="/register" className="underline font-medium text-[#61C9A8]">
          Zarejestruj sie
        </Link>
      </p>
    </section>
  );
}
