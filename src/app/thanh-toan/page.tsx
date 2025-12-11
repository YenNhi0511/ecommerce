"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'cod'
  });
  const [coupon, setCoupon] = useState('');
  const [couponResult, setCouponResult] = useState<{ discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const { token } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const items = cart.map(item => ({ productId: item._id, quantity: item.quantity }));
      const resp = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ items, shippingAddress: { ...formData }, paymentMethod: formData.paymentMethod, couponCode: coupon || undefined })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Đặt hàng thất bại');
      // Clear cart and redirect to confirmation
      clearCart();
      // If user chose ATM (MoMo sandbox), request a MoMo payment and redirect
      if (formData.paymentMethod === 'atm') {
        try {
          const resp2 = await fetch('/api/payments/momo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
            body: JSON.stringify({ orderId: data.orderId })
          });
          const momoData = await resp2.json();
          if (!resp2.ok) throw new Error(momoData.error || 'Không thể tạo yêu cầu MoMo');
          if (momoData.payUrl) {
            // redirect browser to MoMo sandbox UI
            window.location.href = momoData.payUrl;
            return;
          }
          // Fallback: open local MoMo helper page
          router.push(`/momo-test?orderId=${encodeURIComponent(data.orderId)}`);
          return;
        } catch (err) {
          console.error('MoMo redirect error:', err);
          alert(err instanceof Error ? err.message : 'Lỗi khi khởi tạo MoMo');
          router.push(`/xac-nhan-don-hang/${data.orderId}`);
          return;
        }
      }
      router.push(`/xac-nhan-don-hang/${data.orderId}`);
    } catch (err) {
      console.error('Checkout error:', err);
      alert(err instanceof Error ? err.message : 'Đặt hàng thất bại');
    }
  };

  const subtotal = getTotalPrice();
  const discount = couponResult?.discount || 0;
  const grandTotal = Math.max(0, subtotal - discount);

  const applyCoupon = async () => {
    setCouponError('');
    setCouponResult(null);
    try {
      const resp = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon, subtotal })
      });
      const data = await resp.json();
      if (!resp.ok || !data.valid) {
        setCouponError(data.error || 'Mã không hợp lệ');
        return;
      }
      setCouponResult({ discount: data.discount });
    } catch (err) {
      setCouponError('Lỗi khi áp mã');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white font-bold">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">Giỏ hàng</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-blue-600"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Thanh toán</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-500 font-bold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-400">Hoàn tất</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Shipping information */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Thông tin giao hàng</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Họ tên *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Số điện thoại *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="0901234567"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Địa chỉ *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Số nhà, tên đường"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Tỉnh/Thành phố *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Hà Nội, Hồ Chí Minh..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${formData.paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-xs text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</div>
                  </div>
                  <span className="text-2xl">💵</span>
                </label>
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${formData.paymentMethod === 'atm' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="atm"
                    checked={formData.paymentMethod === 'atm'}
                    onChange={handleChange}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">Thanh toán ATM / MoMo (Sandbox)</div>
                    <div className="text-xs text-gray-500">Thanh toán qua Internet Banking hoặc dùng MoMo sandbox để test</div>
                  </div>
                  <span className="text-2xl">🏦</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Đơn hàng</h2>
              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                {/* shipping removed: totals are based on products only */}

                <div className="mt-3">
                  <label className="block text-sm font-medium mb-2">Mã giảm giá</label>
                  <div className="flex gap-2">
                    <input value={coupon} onChange={(e) => setCoupon(e.target.value)} className="flex-1 px-3 py-2 border rounded" placeholder="Nhập mã giảm giá" />
                    <button onClick={applyCoupon} className="bg-blue-600 text-white px-4 rounded">Áp dụng</button>
                  </div>
                  {couponError && <div className="text-red-600 text-sm mt-2">{couponError}</div>}
                  {couponResult && <div className="text-green-600 text-sm mt-2">Giảm {couponResult.discount.toLocaleString('vi-VN')}₫</div>}
                </div>
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-base font-bold text-gray-800">Tổng cộng</span>
                <span className="text-xl font-bold text-red-600">{grandTotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-orange-600 transition mb-3"
                >
                  Đặt hàng
                </button>
              </>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                ← Quay lại giỏ hàng
              </button>
            </div>

            {/* Security badges */}
            <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
              <div className="text-center mb-3">
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-xs text-gray-600 font-medium">Thanh toán an toàn và bảo mật</p>
              </div>
              <div className="flex justify-center space-x-2">
                <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium">Visa</div>
                <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium">MasterCard</div>
                <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium">JCB</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}