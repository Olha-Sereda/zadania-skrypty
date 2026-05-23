import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    axiosClient
      .get(`/orders/${orderId}`)
      .then(({ data }) => setOrder(data))
      .catch(() => {});
  }, [orderId]);

  if (!order) return <p>Ladowanie...</p>;

  return (
    <section className="max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-black">Zamowienie #{order.id}</h1>
      <p className="text-black/60">
        {new Date(order.created_at).toLocaleString("pl-PL")}
      </p>
      <p className="font-semibold">
        Status: <span className="status-paid">{order.status}</span>
      </p>

      <div className="bg-white border border-[#ED9B40]/30 rounded-2xl p-4 space-y-2">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span>
              {item.product_name} x{item.quantity}
            </span>
            <span>{(Number(item.price) * item.quantity).toFixed(2)} zl</span>
          </div>
        ))}
        <div className="border-t border-[#ED9B40]/30 pt-2 flex justify-between font-black text-lg">
          <span>Razem</span>
          <span>{Number(order.total).toFixed(2)} zl</span>
        </div>
      </div>
    </section>
  );
}
