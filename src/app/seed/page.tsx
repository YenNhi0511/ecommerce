'use client';

import { useState } from 'react';

export default function SeedPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seed', {
        method: 'POST'
      });
      const data = await response.json();
      setMessage(data.message || data.error);
    } catch (error) {
      setMessage('Lỗi khi seed dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seed Database</h1>
      <button
        onClick={handleSeed}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Đang tạo...' : 'Tạo 200 sản phẩm mẫu'}
      </button>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}