'use client';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (product.stock <= 0) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={product.stock <= 0}
      className={`px-6 py-3 rounded-lg font-semibold transition ${
        product.stock <= 0 ? 'bg-gray-300 text-black cursor-not-allowed' : added ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {product.stock <= 0 ? 'Hết hàng' : (added ? '✓ Đã thêm vào giỏ' : 'Thêm vào giỏ hàng')}
    </button>
  );
}
