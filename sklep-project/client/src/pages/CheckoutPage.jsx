import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "../hooks/useCart";
import axiosClient from "../api/axiosClient";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder",
);

const cardStyle = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1a1a1a",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#dc2626" },
  },
};

function CheckoutForm() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (items.length === 0) return;
    axiosClient
      .post("/payments/create-intent")
      .then(({ data }) => setClientSecret(data.clientSecret))
      .catch((err) =>
        setError(
          err.response?.data?.message || "Nie udalo sie utworzyc platnosci",
        ),
      );
  }, [items.length]);

  async function handlePay(e) {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setError("");
    setProcessing(true);
    try {
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: elements.getElement(CardElement) },
        });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        const { data } = await axiosClient.post("/orders", {
          paymentMethod: "stripe",
          stripePaymentIntentId: paymentIntent.id,
        });
        await clearCart();
        navigate(`/orders/${data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Platnosc nie powiodla sie");
    } finally {
      setProcessing(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="text-center py-20">
        <h1 className="text-3xl font-black mb-4">
          Brak produktow do oplacenia
        </h1>
      </section>
    );
  }

  return (
    <section className="max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-black">Platnosc (Stripe sandbox)</h1>

      <div className="bg-white border border-[#ED9B40]/30 rounded-2xl p-4 space-y-2">
        <h2 className="font-bold">Podsumowanie</h2>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.product_name} x{item.quantity}
            </span>
            <span>{(Number(item.price) * item.quantity).toFixed(2)} zl</span>
          </div>
        ))}
        <div className="border-t border-[#ED9B40]/30 pt-2 flex justify-between font-black text-lg">
          <span>Razem</span>
          <span>{total.toFixed(2)} zl</span>
        </div>
      </div>

      {error && <p className="text-red-700">{error}</p>}

      <form onSubmit={handlePay} className="space-y-4">
        <div className="border border-[#ED9B40]/40 rounded-lg px-4 py-3 bg-white">
          <CardElement options={cardStyle} />
        </div>
        <p className="text-xs text-black/50">
          Test: 4242 4242 4242 4242 | dowolna data | dowolny CVC
        </p>
        <button
          disabled={processing || !stripe || !clientSecret}
          className="w-full bg-[#ED9B40] text-black rounded-xl py-2 font-semibold hover:bg-[#d88a35] disabled:opacity-40"
        >
          {processing ? "Przetwarzanie..." : `Zaplac ${total.toFixed(2)} zl`}
        </button>
      </form>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
