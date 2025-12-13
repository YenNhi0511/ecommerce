"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function SellerDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const loadStats = async () => {
      setLoading(true);
      try {
        // Load products của seller
        const prodResp = await fetch('/api/products?mine=true', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const prodData = await prodResp.json();
        const products = prodData.products || [];

        // Load orders
        const orderResp = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const orderData = await orderResp.json();
        const orders = orderData.orders || [];

        setStats({
          totalProducts: products.length,
          activeProducts: products.filter((p: any) => p.isActive).length,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: any) => o.orderStatus === 'pending').length,
          revenue: orders
            .filter((o: any) => o.orderStatus === 'delivered')
            .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
        });
      } catch (e) {
        console.error('Load stats error:', e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [token]);

  if (!user || user.role !== 'seller') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1A2F]">
        <div className="text-center text-[#E0F7FF]">
          <p>Bạn cần đăng nhập với tài khoản seller để truy cập trang này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1A2F] py-8">
      <div className="max-w-[1400px] mx-auto px-[4%]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#E0F7FF] mb-2">Bảng điều khiển</h1>
          <p className="text-[#B0D0E8]">Chào mừng trở lại, {user.name || 'Seller'}</p>
        </div>

        {loading ? (
          <div className="text-[#E0F7FF] text-center py-12">Đang tải dữ liệu...</div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-white/80 text-sm">Tổng sản phẩm</div>
                  <div className="text-3xl">📦</div>
                </div>
                <div className="text-white text-3xl font-bold">{stats.totalProducts}</div>
                <div className="text-white/70 text-xs mt-2">Đang hoạt động: {stats.activeProducts}</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-white/80 text-sm">Tổng đơn hàng</div>
                  <div className="text-3xl">🛍️</div>
                </div>
                <div className="text-white text-3xl font-bold">{stats.totalOrders}</div>
                <div className="text-white/70 text-xs mt-2">Tất cả trạng thái</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-white/80 text-sm">Chờ xử lý</div>
                  <div className="text-3xl">⏳</div>
                </div>
                <div className="text-white text-3xl font-bold">{stats.pendingOrders}</div>
                <div className="text-white/70 text-xs mt-2">Đơn cần xác nhận</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-white/80 text-sm">Doanh thu</div>
                  <div className="text-3xl">💰</div>
                </div>
                <div className="text-white text-3xl font-bold">
                  {(stats.revenue / 1000000).toFixed(1)}M
                </div>
                <div className="text-white/70 text-xs mt-2">Đơn đã giao</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#0F2B52] rounded-xl p-6 border border-[#00D4FF]/30">
              <h2 className="text-xl font-bold text-[#E0F7FF] mb-4">Thao tác nhanh</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/seller/products"
                  className="flex items-center gap-4 p-4 bg-[#0A1A2F] rounded-lg hover:bg-[#00D4FF]/10 border border-[#00D4FF]/20 hover:border-[#00D4FF] transition-all duration-200"
                >
                  <div className="text-3xl">📦</div>
                  <div>
                    <div className="text-[#E0F7FF] font-semibold">Quản lý sản phẩm</div>
                    <div className="text-[#B0D0E8] text-sm">Thêm, sửa, xóa sản phẩm</div>
                  </div>
                </Link>

                <Link
                  href="/seller/orders"
                  className="flex items-center gap-4 p-4 bg-[#0A1A2F] rounded-lg hover:bg-[#00D4FF]/10 border border-[#00D4FF]/20 hover:border-[#00D4FF] transition-all duration-200"
                >
                  <div className="text-3xl">🛍️</div>
                  <div>
                    <div className="text-[#E0F7FF] font-semibold">Quản lý đơn hàng</div>
                    <div className="text-[#B0D0E8] text-sm">Xem và xử lý đơn</div>
                  </div>
                </Link>

                <Link
                  href="/seller/analytics"
                  className="flex items-center gap-4 p-4 bg-[#0A1A2F] rounded-lg hover:bg-[#00D4FF]/10 border border-[#00D4FF]/20 hover:border-[#00D4FF] transition-all duration-200"
                >
                  <div className="text-3xl">📊</div>
                  <div>
                    <div className="text-[#E0F7FF] font-semibold">Thống kê</div>
                    <div className="text-[#B0D0E8] text-sm">Xem báo cáo chi tiết</div>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 
