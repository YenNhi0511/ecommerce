"use client"
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

type Props = { initial?: any, onSaved?: (p: any) => void, onCancel?: () => void }

export default function SellerProductForm({ initial = {}, onSaved, onCancel }: Props) {
  const { token } = useAuth();
  const [form, setForm] = useState<any>({
    name: initial.name || '',
    description: initial.description || '',
    price: initial.price || 0,
    originalPrice: initial.originalPrice || 0,
    category: initial.category || '',
    brand: initial.brand || '',
    images: initial.images || [],
    stock: initial.stock || 0,
  });
  const [uploading, setUploading] = useState(false);

  // Reset form when initial changes
  useEffect(() => {
    setForm({
      name: initial.name || '',
      description: initial.description || '',
      price: initial.price || 0,
      originalPrice: initial.originalPrice || 0,
      category: initial.category || '',
      brand: initial.brand || '',
      images: initial.images || [],
      stock: initial.stock || 0,
    });
  }, [initial._id]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = reader.result as string; // data URL
        const resp = await fetch('/api/uploads', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ data }) });
        const j = await resp.json();
        if (j?.url) setForm((s: any) => ({ ...s, images: [...(s.images||[]), j.url] }));
      } catch (e) {
        console.error('upload error', e);
      } finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setForm((s: any) => ({ ...s, images: (s.images || []).filter((_: any, i: number) => i !== index) }));
  };

  const moveImage = (from: number, to: number) => {
    setForm((s: any) => {
      const images = [...(s.images || [])];
      if (from < 0 || from >= images.length || to < 0 || to >= images.length) return s;
      const [item] = images.splice(from, 1);
      images.splice(to, 0, item);
      return { ...s, images };
    });
  };

  const save = async () => {
    try {
      const method = initial._id ? 'PUT' : 'POST';
      const url = initial._id ? `/api/products/${initial._id}` : '/api/products';
      const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify(form) });
      const j = await resp.json();
      if (j?.product || j?._id) {
        // Reset form after successful save
        setForm({
          name: '',
          description: '',
          price: 0,
          originalPrice: 0,
          category: '',
          brand: '',
          images: [],
          stock: 0,
        });
        onSaved?.(j.product || j);
      } else if (j?.error) {
        alert(j.error);
      }
    } catch (e) {
      console.error('save product error', e);
      alert('Lỗi khi lưu sản phẩm');
    }
  };

  const cancel = () => {
    setForm({
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: '',
      brand: '',
      images: [],
      stock: 0,
    });
    onCancel?.();
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-bold mb-3">{initial._id ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}</h3>
      <div className="grid grid-cols-2 gap-3">
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Tên sản phẩm" className="p-2 border" />
        <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Thương hiệu" className="p-2 border" />
        <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Danh mục" className="p-2 border" />
        <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} placeholder="Giá" className="p-2 border" />
        <input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: Number(e.target.value) })} placeholder="Giá gốc" className="p-2 border" />
        <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} placeholder="Kho" className="p-2 border" />
      </div>
      <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả" className="w-full p-2 border mt-3" rows={4} />

      <div className="mt-3">
        <label className="block mb-2">Ảnh sản phẩm</label>
        <input type="file" onChange={onFile} />
        <div className="flex gap-2 mt-2">
          {(form.images || []).map((img: string, i: number) => (
            <div key={i} className="relative">
              <img src={img} alt={`img-${i}`} className="w-20 h-20 object-cover border" />
              <div className="absolute top-0 right-0 flex flex-col">
                <button onClick={() => removeImage(i)} className="bg-red-600 text-white text-xs p-1">×</button>
                <button onClick={() => moveImage(i, Math.max(0, i-1))} className="bg-gray-800 text-white text-xs p-1">‹</button>
                <button onClick={() => moveImage(i, Math.min((form.images||[]).length-1, i+1))} className="bg-gray-800 text-white text-xs p-1">›</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={save} disabled={uploading}>
          {initial._id ? 'Cập nhật' : 'Tạo sản phẩm'}
        </button>
        {initial._id && (
          <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" onClick={cancel}>
            Hủy
          </button>
        )}
      </div>
    </div>
  );
}
