'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const total = getTotalPrice();

  if (cart.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-7xl mb-4">🛒</div>
            <h1 className="text-2xl font-bold mb-3 text-gray-800">Giỏ hàng trống</h1>
            <p className="text-gray-500 mb-8">Chưa có sản phẩm nào trong giỏ hàng của bạn</p>
            <Link href="/" className="inline-block bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng ({cart.length} sản phẩm)</h1>
          <button 
            onClick={clearCart} 
            className="text-red-600 hover:text-red-700 font-medium text-sm"
          >
            Xóa tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white rounded-lg shadow-sm">
              {cart.map((item, index) => (
                <div 
                  key={item._id} 
                  className={`p-4 flex items-center space-x-4 ${index !== cart.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="w-20 h-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image || item.imageUrl || '/placeholder.jpg'} 
                      alt={item.name} 
                      className="object-cover w-full h-full" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/san-pham/${item._id}`}>
                      <h3 className="font-medium text-gray-800 hover:text-blue-600 text-sm line-clamp-2 mb-2">{item.name}</h3>
                    </Link>
                    <p className="text-red-600 font-bold text-base">{item.price.toLocaleString()}₫</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-50 rounded px-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded transition text-gray-600"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded transition text-gray-600"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-gray-400 hover:text-red-600 transition ml-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Thông tin đơn hàng</h2>
              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính ({cart.length} sản phẩm)</span>
                  <span className="font-medium">{total.toLocaleString()}₫</span>
                </div>
                {/* shipping removed: totals are based on products only */}
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-base font-bold text-gray-800">Tổng cộng</span>
                <span className="text-xl font-bold text-red-600">{total.toLocaleString()}₫</span>
              </div>
              <Link 
                href="/thanh-toan" 
                className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-orange-600 transition text-center block mb-3"
              >
                Tiến hành thanh toán
              </Link>
              <Link 
                href="/" 
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition text-center block"
              >
                Tiếp tục mua sắm
              </Link>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
              <div className="space-y-3 text-xs text-gray-600">
                {/* shipping policy hidden since shipping cost removed */}
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Đổi trả miễn phí trong 7 ngày</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}