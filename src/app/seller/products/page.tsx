"use client";
import React, { useEffect, useState } from 'react'
import SellerProductForm from '@/components/SellerProductForm'
import { useAuth } from '@/context/AuthContext'

export default function SellerProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      // Thêm mine=true để chỉ load sản phẩm của seller này
      const resp = await fetch('/api/products?mine=true', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
      const j = await resp.json();
      setProducts(j.products || []);
    } catch (e) {
      console.error('load seller products', e);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [token]);

  const onSaved = (p: any) => {
    // refresh list
    setEditing(null);
    load();
  };

  const onCancel = () => {
    setEditing(null);
  };

  const remove = async (id: string) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
      const resp = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
      const j = await resp.json();
      if (j?.message) load();
    } catch (e) { console.error('delete', e); }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-[4%] p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý sản phẩm của tôi</h1>
      <p className="text-gray-600 mb-4">Quản lý tồn kho và thông tin sản phẩm của bạn</p>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <SellerProductForm initial={editing || {}} onSaved={onSaved} onCancel={onCancel} />
        </div>
        <div className="col-span-2">
          <div className="space-y-3">
            {loading && <div>Đang tải...</div>}
            {products.map(p => (
              <div key={p._id} className="p-3 border rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={p.images?.[0] || '/favicon.svg'} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-gray-600">{p.brand} • {p.category}</div>
                    <div className="text-red-600 font-bold">{Number(p.price).toLocaleString()}₫</div>
                    <div className="text-sm mt-1">
                      <span className={`px-2 py-0.5 rounded ${(p.stock || 0) > 10 ? 'bg-green-100 text-green-700' : (p.stock || 0) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        Tồn kho: {p.stock || 0}
                      </span>
                      <span className="ml-2 text-gray-500">Đã bán: {p.sold || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border rounded hover:bg-blue-50" onClick={() => setEditing(p)}>Edit</button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => remove(p._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
