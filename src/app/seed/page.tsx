'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SeedPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSeed = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch('/api/seed', {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('✅ ' + (data.message || 'Khởi tạo dữ liệu thành công!'));
        setMessage(prev => prev + '\n\n📝 Tài khoản Admin:\n  Email: admin@example.com\n  Password: Password123\n\n📝 Tài khoản Seller:\n  Email: seller@example.com\n  Password: Password123');
      } else {
        setError('❌ ' + (data.error || 'Lỗi không xác định'));
      }
    } catch (error) {
      setError('❌ Lỗi kết nối: ' + (error instanceof Error ? error.message : 'Không thể kết nối tới server'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-[4%] py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">🌱 Khởi Tạo Dữ Liệu</h1>

        <p className="text-black mb-6 text-center">
          Nhấn nút bên dưới để tạo dữ liệu mẫu (sản phẩm, admin, seller):
        </p>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-4 rounded-lg mb-4 transition"
        >
          {loading ? '⏳ Đang khởi tạo...' : '🚀 Khởi Tạo Dữ Liệu'}
        </button>

        {message && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg whitespace-pre-wrap font-mono text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">📋 Hướng dẫn sử dụng:</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li>Nhấn button "Khởi Tạo Dữ Liệu" ở trên</li>
            <li>Đợi quá trình hoàn thành (có thể mất vài giây)</li>
            <li>Sau đó vào <Link href="/dang-nhap" className="font-bold underline text-blue-600">Trang Đăng Nhập</Link></li>
            <li>Nhập email và password của admin hoặc seller</li>
          </ol>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-900 mb-2">⚠️ Lưu ý:</h3>
          <ul className="list-disc list-inside text-yellow-800 space-y-1">
            <li>Chỉ chạy một lần, lần thứ 2 sẽ không tạo lại account (vì đã tồn tại)</li>
            <li>Sẽ xóa toàn bộ sản phẩm cũ và tạo 200+ sản phẩm mới với ảnh từ Cloudinary</li>
            <li>Admin/Seller account sẽ chỉ tạo nếu chưa tồn tại</li>
          </ul>
        </div>
      </div>
    </div>
  );
}