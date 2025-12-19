"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

type Order = {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    product: { name: string; images: string[] };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  createdAt: string;
};

export default function AdminOrdersPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAdminMode(window.location.port === '3001');
    }
  }, []);

  useEffect(() => {
    if (!isAdminMode && (!token || !isAdmin)) return;
    loadOrders();
  }, [token, isAdmin, isAdminMode]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const resp = await fetch('/api/orders', {
        headers
      });
      const data = await resp.json();
      if (resp.ok) {
        setOrders(data.orders || []);
      } else {
        setError(data.error || 'Không thể tải đơn hàng');
      }
    } catch (e: any) {
      setError(e?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const resp = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id: orderId, updates: { orderStatus: status } })
      });
      if (resp.ok) {
        loadOrders();
      } else {
        const data = await resp.json();
        alert(data.error || 'Không thể cập nhật');
      }
    } catch (e: any) {
      alert(e?.message || 'Lỗi');
    }
  };

  if (!user) {
    return <div className="max-w-[1400px] mx-auto px-[4%] p-6">Vui lòng đăng nhập.</div>; 
  }

  if (!isAdminMode && !isAdmin) {
    return <div className="max-w-[1400px] mx-auto px-[4%] p-6">Không có quyền truy cập.</div>; 
  }

  const filteredOrders = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.orderStatus === filterStatus;
    const matchSearch = o._id.includes(searchQuery) || 
                       o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       o.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalRevenue = orders
    .filter(o => o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const statusCounts = {
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    processing: orders.filter(o => o.orderStatus === 'processing').length,
    shipped: orders.filter(o => o.orderStatus === 'shipped').length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
  };

  return (
    <div className="max-w-[1400px] mx-auto px-[4%] p-6">
      <h1 className="text-3xl font-bold mb-6">🛍️ Quản lý đơn hàng</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-xs text-black">Tổng đơn</div>
          <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-xs text-black">Chờ xử lý</div>
          <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="text-xs text-black">Đang xử lý</div>
          <div className="text-2xl font-bold text-indigo-600">{statusCounts.processing}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-xs text-black">Đang giao</div>
          <div className="text-2xl font-bold text-purple-600">{statusCounts.shipped}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-xs text-black">Hoàn thành</div>
          <div className="text-2xl font-bold text-green-600">{statusCounts.delivered}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-xs text-black">Đã hủy</div>
          <div className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg mb-6">
        <div className="text-sm opacity-90">Tổng doanh thu (đơn hoàn thành)</div>
        <div className="text-4xl font-bold mt-2">
          {totalRevenue.toLocaleString('vi-VN')}₫
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Tìm theo mã đơn, tên, email..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="shipped">Đang giao</option>
          <option value="delivered">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => (
            <div key={o._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold">Đơn #{o._id.slice(-6)}</div>
                  <div className="text-sm text-black">
                    Khách: {o.user?.name || 'N/A'} ({o.user?.email || 'N/A'})
                  </div>
                  <div className="text-sm text-black">
                    Ngày: {new Date(o.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-red-600">
                    {o.totalAmount.toLocaleString('vi-VN')}₫
                  </div>
                  <div className="text-xs text-black">{o.paymentMethod}</div>
                </div>
              </div>

              {o.shippingAddress && (
                <div className="text-sm text-black mb-3 p-2 bg-gray-50 rounded">
                  📍 {o.shippingAddress.name} - {o.shippingAddress.phone}<br/>
                  {o.shippingAddress.address}, {o.shippingAddress.city}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  o.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                  o.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-700' :
                  o.orderStatus === 'processing' ? 'bg-blue-100 text-blue-700' :
                  o.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {o.orderStatus}
                </span>

                <div className="flex gap-2">
                  {o.orderStatus === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(o._id, 'processing')}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      Xác nhận
                    </button>
                  )}
                  {o.orderStatus === 'processing' && (
                    <button
                      onClick={() => updateOrderStatus(o._id, 'shipped')}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                    >
                      Gửi hàng
                    </button>
                  )}
                  {o.orderStatus === 'shipped' && (
                    <button
                      onClick={() => updateOrderStatus(o._id, 'delivered')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      Hoàn thành
                    </button>
                  )}
                  {o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled' && (
                    <button
                      onClick={() => updateOrderStatus(o._id, 'cancelled')}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
