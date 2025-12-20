'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    // Check admin authentication
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');

    if (!token || !userStr) {
      router.push('/admin/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        router.push('/admin/login');
        return;
      }
      setAdminUser(user);
      setIsAuthenticated(true);
    } catch {
      router.push('/admin/login');
      return;
    }

    setLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  // Login page - no layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-black">Đang kiểm tra...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated - show admin layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white shadow-lg z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="text-4xl">🎛️</div>
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-xs text-gray-400">TechZone</p>
            </div>
          </div>

          <nav className="space-y-2">
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                pathname === '/admin/dashboard' || pathname === '/admin'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">📊</span>
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              href="/admin/products"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                pathname?.startsWith('/admin/products')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">📦</span>
              <span className="font-medium">Sản phẩm</span>
            </Link>

            <Link
              href="/admin/orders"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                pathname?.startsWith('/admin/orders')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">📋</span>
              <span className="font-medium">Đơn hàng</span>
            </Link>

            <Link
              href="/admin/users"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                pathname?.startsWith('/admin/users')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">👥</span>
              <span className="font-medium">Người dùng</span>
            </Link>

            <Link
              href="/admin/analytics"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                pathname?.startsWith('/admin/analytics')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">📈</span>
              <span className="font-medium">Analytics</span>
            </Link>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-sm truncate">{adminUser?.name}</p>
              <p className="text-xs text-gray-400 truncate">{adminUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-black">
                {pathname === '/admin/dashboard' || pathname === '/admin' ? 'Dashboard' :
                 pathname?.startsWith('/admin/products') ? 'Quản lý sản phẩm' :
                 pathname?.startsWith('/admin/orders') ? 'Quản lý đơn hàng' :
                 pathname?.startsWith('/admin/users') ? 'Quản lý người dùng' :
                 pathname?.startsWith('/admin/analytics') ? 'Analytics' :
                 'Admin Panel'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm text-black hover:text-blue-600 transition"
              >
                🏠 Xem trang User
              </a>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t px-6 py-4">
          <p className="text-sm text-black text-center">
            © 2025 TechZone Admin Panel. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
