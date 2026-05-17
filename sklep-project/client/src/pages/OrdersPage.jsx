import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axiosClient.get('/orders').then(({ data }) => setOrders(data)).catch(() => {});
  }, []);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-black">Zamowienia</h1>
      {orders.length === 0 && <p className="text-black/60">Brak zamowien</p>}
      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block bg-white border border-black/10 rounded-2xl p-4 hover:shadow-md"
          >
            <div className="flex justify-between">
              <span className="font-bold">Zamowienie #{order.id}</span>
              <span className="font-semibold">{Number(order.total).toFixed(2)} zl</span>
            </div>
            <p className="text-sm text-black/60">{new Date(order.created_at).toLocaleString('pl-PL')}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
