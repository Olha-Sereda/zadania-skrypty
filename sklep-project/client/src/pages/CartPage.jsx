import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, total, updateQuantity, removeFromCart } = useCart();

  if (items.length === 0) {
    return (
      <section className="text-center py-20">
        <h1 className="text-3xl font-black mb-4">Koszyk jest pusty</h1>
        <Link to="/" className="underline">Przejdz do produktow</Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-black">Koszyk</h1>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-white border border-black/10 rounded-2xl p-4">
            <div>
              <p className="font-bold">{item.product_name}</p>
              <p className="text-sm text-black/70">{Number(item.price).toFixed(2)} zl x {item.quantity}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
              <span className="font-semibold w-8 text-center">{item.quantity}</span>
              <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              <button className="ml-4 text-red-600 text-sm font-medium" onClick={() => removeFromCart(item.id)}>Usun</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-2xl font-black">Razem: {total.toFixed(2)} zl</p>
        <Link to="/checkout" className="bg-black text-white rounded-xl px-6 py-2 font-semibold">Przejdz do platnosci</Link>
      </div>
    </section>
  );
}
