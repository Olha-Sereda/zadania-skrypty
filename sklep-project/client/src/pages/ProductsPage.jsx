import { useEffect, useState, useCallback } from "react";
import axiosClient from "../api/axiosClient";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedId, setAddedId] = useState(null);
  const [toast, setToast] = useState(null);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = useCallback(
    async (product) => {
      setAddedId(product.id);
      try {
        await addToCart(product.id, 1);
        setToast(`${product.name} dodano do koszyka`);
      } catch {
        setToast("Nie udalo sie dodac do koszyka");
      }
      setTimeout(() => setAddedId(null), 600);
      setTimeout(() => setToast(null), 2500);
    },
    [addToCart],
  );

  useEffect(() => {
    axiosClient
      .get("/categories")
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    axiosClient
      .get("/products", {
        params: selectedCategory ? { categoryId: selectedCategory } : {},
      })
      .then(({ data }) => setProducts(data))
      .catch((err) =>
        setError(
          err.response?.data?.message || "Nie udalo sie pobrac produktow",
        ),
      )
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const handleCategoryChange = (event) => {
    setError("");
    setLoading(true);
    setSelectedCategory(event.target.value);
  };

  return (
    <section className="space-y-6 relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#ED9B40] text-black font-semibold px-5 py-3 rounded-xl shadow-lg animate-bounce">
          {toast}
        </div>
      )}
      <div className="p-5 border border-[#ED9B40]/40 rounded-2xl bg-white shadow-sm">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">
          Nowoczesny Sklep
        </h1>
        <p className="text-black/70 mt-2">
          React Hooks + Axios + Node REST API + PostgreSQL
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="category" className="font-semibold">
          Kategoria:
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="border border-[#ED9B40]/40 rounded-lg px-3 py-2 bg-white"
        >
          <option value="">Wszystkie</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Ladowanie...</p>}
      {error && <p className="text-red-700">{error}</p>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <article
            key={product.id}
            className="bg-white border border-[#ED9B40]/30 rounded-2xl p-4 shadow-sm"
          >
            <h2 className="text-xl font-bold">{product.name}</h2>
            <p className="text-black/70 text-sm mt-1 min-h-12">
              {product.description}
            </p>
            <p className="text-xs uppercase tracking-wide text-black/50 mt-2">
              {product.category_name || "Brak kategorii"}
            </p>
            <p className="font-black text-2xl mt-3">
              {Number(product.price).toFixed(2)} zl
            </p>
            <p className="text-sm text-black/70">Stan: {product.stock}</p>
            <button
              disabled={!isAuthenticated || addedId === product.id}
              className={`mt-4 w-full rounded-xl px-4 py-2 text-white transition-all duration-300 disabled:opacity-40 ${
                addedId === product.id
                  ? "bg-[#61C9A8] scale-95"
                  : "bg-[#ED9B40] text-black font-semibold hover:bg-[#d88a35]"
              }`}
              onClick={() => handleAddToCart(product)}
            >
              {!isAuthenticated
                ? "Zaloguj sie, aby dodac"
                : addedId === product.id
                  ? "✓ Dodano!"
                  : "Dodaj do koszyka"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
