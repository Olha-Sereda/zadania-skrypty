import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axiosClient from '../api/axiosClient';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  async function handlePay(e) {
    e.preventDefault();
    setError('');
    setProcessing(true);
    try {
      const { data } = await axiosClient.post('/orders', {
        paymentMethod: 'card',
        cardLast4: cardNumber.slice(-4),
      });
      await clearCart();
      navigate(`/orders/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Platnosc nie powiodla sie');
    } finally {
      setProcessing(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="text-center py-20">
        <h1 className="text-3xl font-black mb-4">Brak produktow do oplacenia</h1>
      </section>
    );
  }

  return (
    <section className="max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-black">Platnosc</h1>

      <div className="bg-white border border-black/10 rounded-2xl p-4 space-y-2">
        <h2 className="font-bold">Podsumowanie</h2>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.product_name} x{item.quantity}</span>
            <span>{(Number(item.price) * item.quantity).toFixed(2)} zl</span>
          </div>
        ))}
        <div className="border-t border-black/10 pt-2 flex justify-between font-black text-lg">
          <span>Razem</span>
          <span>{total.toFixed(2)} zl</span>
        </div>
      </div>

      {error && <p className="text-red-700">{error}</p>}

      <form onSubmit={handlePay} className="space-y-4">
        <input
          type="text"
          placeholder="Numer karty"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          required
          className="w-full border border-black/20 rounded-lg px-4 py-2"
        />
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="MM/RR"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            required
            className="flex-1 border border-black/20 rounded-lg px-4 py-2"
          />
          <input
            type="text"
            placeholder="CVV"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            required
            className="w-24 border border-black/20 rounded-lg px-4 py-2"
          />
        </div>
        <button
          disabled={processing}
          className="w-full bg-black text-white rounded-xl py-2 font-semibold disabled:bg-black/30"
        >
          {processing ? 'Przetwarzanie...' : `Zaplac ${total.toFixed(2)} zl`}
        </button>
      </form>
    </section>
  );
}
