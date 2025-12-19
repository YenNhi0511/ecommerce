'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Stats = {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrders: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    lowStockCount: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token is valid before loading
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const [ordersRes, productsRes, usersRes] = await Promise.all([
        fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      // Check for auth errors
      if (ordersRes.status === 401 || usersRes.status === 401) {
        console.error('Token expired or invalid');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
        return;
      }

      // Handle errors gracefully
      const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] };
      const productsData = productsRes.ok ? await productsRes.json() : { products: [] };
      const usersData = usersRes.ok ? await usersRes.json() : { users: [] };

      const orders = ordersData.orders || [];
      const products = productsData.products || [];
      const users = usersData.users || [];

      setStats({
        totalRevenue: orders
          .filter((o: any) => o.orderStatus === 'delivered')
          .reduce((sum: number, o: any) => sum + o.totalAmount, 0),
        totalOrders: orders.length,
        totalUsers: users.length,
        totalProducts: products.length,
        lowStockCount: products.filter((p: any) => (p.stock || 0) < 10).length,
        pendingOrders: orders.filter((o: any) => o.orderStatus === 'pending').length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-black">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">💰</div>
            <div className="text-sm opacity-90">Doanh thu</div>
          </div>
          <div className="text-3xl font-bold mb-1">
            {stats.totalRevenue.toLocaleString('vi-VN')}₫
          </div>
          <div className="text-sm opacity-75">Tổng doanh thu</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">📋</div>
            <div className="text-sm opacity-90">Đơn hàng</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalOrders}</div>
          <div className="text-sm opacity-75">
            {stats.pendingOrders} đang chờ xử lý
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">👥</div>
            <div className="text-sm opacity-90">Người dùng</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalUsers}</div>
          <div className="text-sm opacity-75">Tổng thành viên</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">📦</div>
            <div className="text-sm opacity-90">Sản phẩm</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalProducts}</div>
          <div className="text-sm opacity-75">Tổng sản phẩm</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">⚠️</div>
            <div className="text-sm opacity-90">Cảnh báo</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.lowStockCount}</div>
          <div className="text-sm opacity-75">Sản phẩm sắp hết</div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">📈</div>
            <div className="text-sm opacity-90">Analytics</div>
          </div>
          <Link href="/admin/analytics" className="text-2xl font-bold hover:underline">
            Xem chi tiết →
          </Link>
          <div className="text-sm opacity-75">Phân tích dữ liệu</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">⚡ Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/products"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
          >
            <div className="text-3xl mb-2">➕</div>
            <div className="font-medium">Thêm sản phẩm</div>
          </Link>
          <Link
            href="/admin/orders"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-center"
          >
            <div className="text-3xl mb-2">📦</div>
            <div className="font-medium">Xem đơn hàng</div>
          </Link>
          <Link
            href="/admin/users"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center"
          >
            <div className="text-3xl mb-2">👥</div>
            <div className="font-medium">Quản lý user</div>
          </Link>
          <Link
            href="/admin/analytics"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-center"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="font-medium">Analytics</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
