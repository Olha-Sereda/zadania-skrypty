import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function navClass({ isActive }) {
  return isActive
    ? "text-white bg-black px-3 py-1 rounded-full"
    : "text-black px-3 py-1";
}

export default function Layout({ children }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffd39b,_#f6f2ec_60%)] text-zinc-900">
      <header className="border-b border-black/10 backdrop-blur sticky top-0 bg-[#f6f2ec]/90 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <Link to="/" className="font-black tracking-tight text-xl">
            Sklep React + Node
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm font-medium">
            <NavLink to="/" className={navClass}>
              Produkty
            </NavLink>
            <NavLink to="/cart" className={navClass}>
              Koszyk
            </NavLink>
            <NavLink to="/orders" className={navClass}>
              Zamowienia
            </NavLink>
            {!isAuthenticated && (
              <NavLink to="/login" className={navClass}>
                Logowanie
              </NavLink>
            )}
            {!isAuthenticated && (
              <NavLink to="/register" className={navClass}>
                Rejestracja
              </NavLink>
            )}
            {isAuthenticated && (
              <button
                className="px-3 py-1 border border-black rounded-full hover:bg-black hover:text-white"
                onClick={logout}
              >
                Wyloguj
              </button>
            )}
          </nav>
          <div className="text-sm text-black/70">
            {isAuthenticated ? `Zalogowany: ${user.full_name}` : "Tryb goscia"}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
