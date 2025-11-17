'use client';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className={`px-6 py-3 rounded-lg font-semibold transition ${
        added
          ? 'bg-green-600 text-white'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {added ? '✓ Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
    </button>
  );
}
