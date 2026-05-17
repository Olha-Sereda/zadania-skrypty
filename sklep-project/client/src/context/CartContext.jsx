import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const { isAuthenticated } = useAuth();

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) { setItems([]); return; }
    try {
      const { data } = await axiosClient.get('/cart');
      setItems(data);
    } catch {
      setItems([]);
    }
  }, [isAuthenticated]);

  useEffect(() => { loadCart(); }, [loadCart]);

  async function addToCart(productId, quantity = 1) {
    await axiosClient.post('/cart', { productId, quantity });
    await loadCart();
  }

  async function updateQuantity(itemId, quantity) {
    await axiosClient.put(`/cart/${itemId}`, { quantity });
    await loadCart();
  }

  async function removeFromCart(itemId) {
    await axiosClient.delete(`/cart/${itemId}`);
    await loadCart();
  }

  async function clearCart() {
    await axiosClient.delete('/cart');
    setItems([]);
  }

  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, addToCart, updateQuantity, removeFromCart, clearCart, loadCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
