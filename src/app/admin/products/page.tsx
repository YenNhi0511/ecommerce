"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

type Product = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  sold: number;
  category: string;
  brand: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
};

export default function AdminProductsPage() {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAdminMode, setIsAdminMode] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAdminMode(window.location.port === '3001');
    }
  }, []);

  useEffect(() => {
    if (!isAdminMode && (!token || !isAdmin)) return;
    loadProducts();
  }, [token, isAdmin, isAdminMode]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const resp = await fetch('/api/products', {
        headers
      });
      const data = await resp.json();
      if (resp.ok) {
        setProducts(data.products || []);
      } else {
        setError(data.error || 'Không thể tải sản phẩm');
      }
    } catch (e: any) {
      setError(e?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    if (!confirm(`${currentStatus ? 'Ẩn' : 'Hiện'} sản phẩm này?`)) return;
    try {
      const resp = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (resp.ok) {
        loadProducts();
      } else {
        const data = await resp.json();
        alert(data.error || 'Không thể cập nhật');
      }
    } catch (e: any) {
      alert(e?.message || 'Lỗi');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Xóa vĩnh viễn sản phẩm này?')) return;
    try {
      const resp = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        loadProducts();
      } else {
        const data = await resp.json();
        alert(data.error || 'Không thể xóa');
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

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalSold = products.reduce((sum, p) => sum + (p.sold || 0), 0);
  const lowStockCount = products.filter(p => (p.stock || 0) < 10).length;

  return (
    <div className="max-w-[1400px] mx-auto px-[4%] p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black">📦 Quản lý sản phẩm</h1>
        <Link href="/seller/products" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          ➕ Thêm sản phẩm mới
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-black font-medium">Tổng sản phẩm</div>
          <div className="text-2xl font-bold text-blue-600">{products.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-black font-medium">Tồn kho</div>
          <div className="text-2xl font-bold text-green-600">{totalStock.toLocaleString()}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-black font-medium">Đã bán</div>
          <div className="text-2xl font-bold text-purple-600">{totalSold.toLocaleString()}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm text-black font-medium">Sắp hết hàng</div>
          <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Tìm kiếm sản phẩm..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black placeholder:text-black"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'Tất cả danh mục' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <div key={p._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <img 
                src={p.images?.[0] || '/favicon.svg'} 
                alt={p.name}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h3 className="font-semibold line-clamp-2 mb-1 text-black">{p.name}</h3>
              <p className="text-sm text-black">{p.brand} • {p.category}</p>
              <p className="text-red-600 font-bold mt-2">
                {p.price.toLocaleString('vi-VN')}₫
              </p>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className={`px-2 py-1 rounded ${
                  (p.stock || 0) > 10 ? 'bg-green-100 text-green-700' :
                  (p.stock || 0) > 0 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  Kho: {p.stock || 0}
                </span>
                <span className="text-black">Bán: {p.sold || 0}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => toggleProductStatus(p._id, p.isActive !== false)}
                  className={`flex-1 px-2 py-1 rounded text-xs ${
                    p.isActive !== false 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {p.isActive !== false ? '👁️ Ẩn' : '👁️ Hiện'}
                </button>
                <button
                  onClick={() => deleteProduct(p._id)}
                  className="flex-1 px-2 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
