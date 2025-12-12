'use client';

import { useState } from 'react';

export default function LoginDebugPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Password123');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setResponse('✅ Đăng nhập thành công!\n\n' + JSON.stringify(data, null, 2));
      } else {
        setResponse('❌ Lỗi: ' + (data.error || 'Không rõ'));
      }
    } catch (err) {
      setResponse('❌ Lỗi kết nối: ' + (err instanceof Error ? err.message : 'Không xác định'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-6">🔍 Debug Login</h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block font-bold mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Password:</label>
            <input
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            {loading ? 'Đang test...' : '🧪 Test Login'}
          </button>
        </div>

        {response && (
          <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm whitespace-pre-wrap">
            {response}
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <h3 className="font-bold mb-2">💡 Hướng dẫn debug:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Thay đổi email/password ở trên</li>
            <li>Bấm "🧪 Test Login" để test</li>
            <li>Kiểm tra response (success hoặc error)</li>
            <li>Nếu lỗi 401, có thể email không tìm thấy hoặc password sai</li>
            <li>Mở F12 → Network tab để xem chi tiết request/response</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
