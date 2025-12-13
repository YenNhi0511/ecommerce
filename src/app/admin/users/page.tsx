"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

type User = {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  createdAt: string;
  isActive?: boolean;
};

export default function AdminUsersPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAdminMode(window.location.port === '3001');
    }
  }, []);

  useEffect(() => {
    if (!isAdminMode && (!token || !isAdmin)) return;
    loadUsers();
  }, [token, isAdmin, isAdminMode]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const resp = await fetch('/api/admin/users', {
        headers
      });
      const data = await resp.json();
      if (resp.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.error || 'Không thể tải danh sách người dùng');
      }
    } catch (e: any) {
      setError(e?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!confirm(`Đổi role người dùng thành ${newRole}?`)) return;
    try {
      const resp = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, updates: { role: newRole } })
      });
      const data = await resp.json();
      if (resp.ok) {
        loadUsers();
      } else {
        alert(data.error || 'Không thể cập nhật role');
      }
    } catch (e: any) {
      alert(e?.message || 'Lỗi khi cập nhật');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'khóa' : 'mở khóa';
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;
    try {
      const resp = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, updates: { isActive: !currentStatus } })
      });
      const data = await resp.json();
      if (resp.ok) {
        loadUsers();
      } else {
        alert(data.error || 'Không thể cập nhật trạng thái');
      }
    } catch (e: any) {
      alert(e?.message || 'Lỗi khi cập nhật');
    }
  };

  if (!user) {
    return (
      <div className="max-w-[1400px] mx-auto px-[4%] p-6">
        <p>Vui lòng đăng nhập để truy cập trang quản trị.</p>
      </div>
    );
  }

  if (!isAdminMode && !isAdmin) {
    return (
      <div className="max-w-[1400px] mx-auto px-[4%] p-6">
        <p>Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto px-[4%] p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">👥 Quản lý người dùng</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Tìm kiếm theo tên hoặc email..."
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Tổng người dùng</div>
          <div className="text-2xl font-bold text-blue-600">{users.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Khách hàng</div>
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.role === 'customer').length}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Người bán</div>
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === 'seller').length}
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Admin</div>
          <div className="text-2xl font-bold text-orange-600">
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={u.role}
                      onChange={(e) => updateUserRole(u._id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-semibold border-0 ${
                        u.role === 'admin' ? 'bg-red-100 text-red-800' :
                        u.role === 'seller' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      <option value="customer">Khách hàng</option>
                      <option value="seller">Người bán</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      u.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.isActive !== false ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => toggleUserStatus(u._id, u.isActive !== false)}
                      className={`px-3 py-1 rounded ${
                        u.isActive !== false 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {u.isActive !== false ? '🔒 Khóa' : '🔓 Mở khóa'}
                    </button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
