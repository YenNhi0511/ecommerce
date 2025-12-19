'use client';

import { useState } from 'react';
import bcrypt from 'bcryptjs';

export default function ResetPasswordPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResetAdmin = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Hash new password
      const newPassword = 'admin123';
      const hashed = await bcrypt.hash(newPassword, 10);

      // Call reset endpoint
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com',
          newPassword: hashed
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Reset password admin thành công!\n\n📝 Thông tin đăng nhập mới:\nEmail: admin@example.com\nPassword: admin123');
      } else {
        setError('❌ Lỗi: ' + (data.error || 'Không rõ'));
      }
    } catch (err) {
      setError('❌ Lỗi: ' + (err instanceof Error ? err.message : 'Không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetSeller = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Hash new password
      const newPassword = 'seller123';
      const hashed = await bcrypt.hash(newPassword, 10);

      // Call reset endpoint
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'seller@example.com',
          newPassword: hashed
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Reset password seller thành công!\n\n📝 Thông tin đăng nhập mới:\nEmail: seller@example.com\nPassword: seller123');
      } else {
        setError('❌ Lỗi: ' + (data.error || 'Không rõ'));
      }
    } catch (err) {
      setError('❌ Lỗi: ' + (err instanceof Error ? err.message : 'Không xác định'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-[4%] py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">🔐 Reset Password</h1>

        <p className="text-black mb-6 text-center">
          Bấm button dưới để reset password admin/seller:
        </p>

        <div className="space-y-4 mb-6">
          <button
            onClick={handleResetAdmin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            {loading ? '⏳ Đang reset...' : '🔄 Reset Admin Password → admin123'}
          </button>

          <button
            onClick={handleResetSeller}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            {loading ? '⏳ Đang reset...' : '🔄 Reset Seller Password → seller123'}
          </button>
        </div>

        {message && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg whitespace-pre-wrap font-mono text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">📋 Hướng dẫn:</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li>Bấm button reset password ở trên</li>
            <li>Password mới sẽ được hash và update vào database</li>
            <li>Sau đó vào <a href="/dang-nhap" className="font-bold underline">/dang-nhap</a></li>
            <li>Dùng password mới để đăng nhập (admin123 hoặc seller123)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
