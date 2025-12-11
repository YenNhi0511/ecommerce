"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

type Order = {
  _id: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt?: string;
  user?: {
    name?: string;
    email?: string;
  };
};

type Coupon = {
  _id: string;
  code: string;
  type: 'percent' | 'amount' | string;
  value: number;
  expiresAt?: string;
  minSubtotal?: number;
  active?: boolean;
};

export default function AdminPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percent',
    value: 0,
    expiresAt: '',
    minSubtotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  const isAdmin = user && (user as any).role === 'admin';

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const [orderResp, productResp, couponResp] = await Promise.all([
          fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/coupons', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const orderData = await orderResp.json();
        if (orderResp.ok && orderData.orders) {
          setOrders(orderData.orders);
        } else if (!orderResp.ok) {
          setError(orderData.error || 'Không thể tải đơn hàng');
        }

        const productData = await productResp.json();
        if (productData.products) setProducts(productData.products);

        const couponData = await couponResp.json();
        if (couponData.coupons) setCoupons(couponData.coupons);
      } catch (e: any) {
        setError(e?.message || 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const handleCouponChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setCouponForm(prev => ({
      ...prev,
      [name]:
        name === 'value' || name === 'minSubtotal'
          ? Number(value)
          : value,
    }));
  };

  const createCoupon = async () => {
    if (!token) return;
    try {
      setCreatingCoupon(true);
      setError('');
      const resp = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(couponForm),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Không thể tạo mã giảm giá');
      }
      setCoupons(prev => [...prev, data.coupon as Coupon]);
      setCouponForm({
        code: '',
        type: 'percent',
        value: 0,
        expiresAt: '',
        minSubtotal: 0,
      });
    } catch (e: any) {
      setError(e?.message || 'Lỗi khi tạo mã giảm giá');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const toggleCouponActive = async (coupon: Coupon) => {
    if (!token) return;
    try {
      const resp = await fetch('/api/coupons', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: coupon._id,
          updates: { active: !coupon.active },
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Không thể cập nhật mã giảm giá');
      }
      setCoupons(prev =>
        prev.map(c => (c._id === coupon._id ? (data.coupon as Coupon) : c)),
      );
    } catch (e: any) {
      setError(e?.message || 'Lỗi khi cập nhật mã giảm giá');
    }
  };

  const deleteCoupon = async (coupon: Coupon) => {
    if (!token) return;
    if (!window.confirm(`Xóa mã giảm giá ${coupon.code}?`)) return;
    try {
      const resp = await fetch(`/api/coupons?id=${coupon._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Không thể xóa mã giảm giá');
      }
      setCoupons(prev => prev.filter(c => c._id !== coupon._id));
    } catch (e: any) {
      setError(e?.message || 'Lỗi khi xóa mã giảm giá');
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    if (!token) return;
    try {
      setSavingOrderId(orderId);
      setError('');
      const resp = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: orderId, updates }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Không thể cập nhật đơn hàng');
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? (data.order as Order) : o)),
      );
    } catch (e: any) {
      setError(e?.message || 'Lỗi khi cập nhật đơn hàng');
    } finally {
      setSavingOrderId(null);
    }
  };

  const shortId = (id: string) => (id ? id.slice(-6) : '');

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>Vui lòng đăng nhập để truy cập trang quản trị.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>Tài khoản của bạn không có quyền quản trị.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 text-gray-600 text-sm">Đang tải dữ liệu…</div>
      )}

      {/* Orders */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Đơn hàng gần đây</h2>
        {orders.length === 0 ? (
          <div>Không có đơn hàng</div>
        ) : (
          <ul className="space-y-3">
            {orders.map(o => (
              <li
                key={o._id}
                className="p-4 border rounded flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm"
              >
                <div className="space-y-1">
                  <div className="font-semibold">
                    Đơn #{shortId(o._id)} —{' '}
                    <span className="text-red-600">
                      {o.totalAmount?.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  <div className="text-gray-700">
                    Trạng thái đơn: {o.orderStatus}{' '}
                    | Thanh toán: {o.paymentStatus || 'pending'} (
                    {o.paymentMethod || 'N/A'})
                  </div>
                  {o.user && (
                    <div className="text-gray-600">
                      Khách hàng: {o.user.name || ''}{' '}
                      {o.user.email ? `(${o.user.email})` : ''}
                    </div>
                  )}
                  {o.createdAt && (
                    <div className="text-gray-500 text-xs">
                      Ngày tạo:{' '}
                      {new Date(o.createdAt).toLocaleString('vi-VN')}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {o.paymentStatus !== 'paid' && (
                    <button
                      onClick={() =>
                        updateOrder(o._id, {
                          paymentStatus: 'paid',
                          orderStatus:
                            o.orderStatus === 'pending'
                              ? 'processing'
                              : o.orderStatus,
                        })
                      }
                      disabled={savingOrderId === o._id}
                      className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Đánh dấu đã thanh toán
                    </button>
                  )}
                  {o.orderStatus === 'pending' && (
                    <button
                      onClick={() =>
                        updateOrder(o._id, { orderStatus: 'processing' })
                      }
                      disabled={savingOrderId === o._id}
                      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      Xử lý đơn
                    </button>
                  )}
                  {o.orderStatus === 'processing' && (
                    <button
                      onClick={() =>
                        updateOrder(o._id, { orderStatus: 'shipped' })
                      }
                      disabled={savingOrderId === o._id}
                      className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Đã gửi hàng
                    </button>
                  )}
                  {o.orderStatus === 'shipped' && (
                    <button
                      onClick={() =>
                        updateOrder(o._id, { orderStatus: 'delivered' })
                      }
                      disabled={savingOrderId === o._id}
                      className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Đã giao
                    </button>
                  )}
                  {o.orderStatus !== 'cancelled' && (
                    <button
                      onClick={() =>
                        updateOrder(o._id, { orderStatus: 'cancelled' })
                      }
                      disabled={savingOrderId === o._id}
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Hủy đơn
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Coupons */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Mã giảm giá</h2>
        <div className="bg-white p-4 rounded border mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                Mã
              </label>
              <input
                name="code"
                value={couponForm.code}
                onChange={handleCouponChange}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="SALE2025"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Loại
              </label>
              <select
                name="type"
                value={couponForm.type}
                onChange={handleCouponChange}
                className="w-full border rounded px-2 py-1 text-sm"
              >
                <option value="percent">% phần trăm</option>
                <option value="amount">Số tiền cố định</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Giá trị
              </label>
              <input
                type="number"
                name="value"
                value={couponForm.value}
                onChange={handleCouponChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Đơn tối thiểu
              </label>
              <input
                type="number"
                name="minSubtotal"
                value={couponForm.minSubtotal}
                onChange={handleCouponChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium mb-1">
                Hết hạn
              </label>
              <input
                type="date"
                name="expiresAt"
                value={couponForm.expiresAt}
                onChange={handleCouponChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={createCoupon}
                disabled={creatingCoupon}
                className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingCoupon ? 'Đang tạo...' : 'Tạo mã'}
              </button>
            </div>
          </div>
        </div>

        <div>
          {coupons.length === 0 ? (
            <div>Chưa có mã giảm giá</div>
          ) : (
            <ul className="space-y-2">
              {coupons.map(c => (
                <li
                  key={c._id}
                  className="p-3 border rounded flex justify-between items-center text-sm"
                >
                  <div>
                    <div className="font-semibold">
                      {c.code} —{' '}
                      {c.type === 'percent'
                        ? `${c.value}%`
                        : `${c.value.toLocaleString('vi-VN')}₫`}
                    </div>
                    <div className="text-gray-600">
                      {c.expiresAt
                        ? `Hết hạn: ${new Date(
                            c.expiresAt,
                          ).toLocaleDateString('vi-VN')}`
                        : 'Không giới hạn thời gian'}
                    </div>
                    {typeof c.minSubtotal === 'number' && c.minSubtotal > 0 && (
                      <div className="text-gray-500 text-xs">
                        Áp dụng cho đơn từ{' '}
                        {c.minSubtotal.toLocaleString('vi-VN')}₫
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleCouponActive(c)}
                      className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 text-xs"
                    >
                      {c.active ? 'Vô hiệu' : 'Kích hoạt'}
                    </button>
                    <button
                      onClick={() => deleteCoupon(c)}
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-xs"
                    >
                      Xóa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Products overview */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Sản phẩm</h2>
        {products.length === 0 ? (
          <div>Không có sản phẩm</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p: any) => (
              <li key={p._id} className="p-3 border rounded text-sm">
                <div className="font-semibold">{p.name}</div>
                <div className="text-gray-700">
                  {p.price?.toLocaleString('vi-VN')}₫
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
