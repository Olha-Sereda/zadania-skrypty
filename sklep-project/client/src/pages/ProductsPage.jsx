import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

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
    <section className="space-y-6">
      <div className="p-5 border border-black/10 rounded-2xl bg-white/80 shadow-sm">
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
          className="border border-black/20 rounded-lg px-3 py-2 bg-white"
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
            className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm"
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
              disabled={!isAuthenticated}
              className="mt-4 w-full rounded-xl px-4 py-2 bg-black text-white disabled:bg-black/30"
              onClick={() => addToCart(product.id, 1)}
            >
              {isAuthenticated ? "Dodaj do koszyka" : "Zaloguj sie, aby dodac"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
