"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMessage, setPwMessage] = useState({ type: '' as 'error' | 'success' | '', text: '' });
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState({ type: '' as 'error' | 'success' | '', text: '' });
  const { user, token, upgradeSeller } = useAuth();
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tài khoản của tôi</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-3 py-2 rounded ${activeTab === 'profile' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-3 py-2 rounded ${activeTab === 'orders' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                Lịch sử đơn hàng
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full text-left px-3 py-2 rounded ${activeTab === 'addresses' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                Địa chỉ giao hàng
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full text-left px-3 py-2 rounded ${activeTab === 'wishlist' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                Danh sách yêu thích
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Thông tin cá nhân</h2>
                {upgradeMessage.text && (
                  <div className={`${upgradeMessage.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'} mb-4 p-3 rounded`}>
                    {upgradeMessage.text}
                  </div>
                )}
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Họ tên</label>
                    <input
                      type="text"
                      defaultValue={user?.name || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Loại tài khoản</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                      {user?.role === 'customer' ? 'Khách hàng' : user?.role === 'seller' ? 'Người bán' : 'Admin'}
                    </div>
                  </div>
                </form>

                {/* Upgrade to seller section */}
                {user?.role === 'customer' && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-blue-600">Nâng cấp tài khoản</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 mb-3">
                        Nâng cấp tài khoản của bạn lên Người bán để có thể bán sản phẩm trên sàn thương mại điện tử của chúng tôi.
                      </p>
                      <button
                        onClick={async () => {
                          setUpgradeLoading(true);
                          setUpgradeMessage({ type: '', text: '' });
                          try {
                            if (!user?.email) throw new Error('Email không được tìm thấy');
                            await upgradeSeller(user.email);
                            setUpgradeMessage({ type: 'success', text: 'Nâng cấp thành công! Chuyển hướng...' });
                            setTimeout(() => {
                              router.push('/seller');
                            }, 1500);
                          } catch (err) {
                            setUpgradeMessage({ 
                              type: 'error', 
                              text: err instanceof Error ? err.message : 'Nâng cấp thất bại'
                            });
                          } finally {
                            setUpgradeLoading(false);
                          }
                        }}
                        disabled={upgradeLoading}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {upgradeLoading ? 'Đang xử lý...' : 'Nâng cấp lên Người bán'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Change password */}
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Đổi mật khẩu</h3>
                  {pwMessage.text && (
                    <div className={`${pwMessage.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'} mb-4 p-3 rounded`}>
                      {pwMessage.text}
                    </div>
                  )}
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setPwMessage({ type: '', text: '' });
                    if (pwForm.newPassword !== pwForm.confirmPassword) {
                      setPwMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận không khớp' });
                      return;
                    }
                    if (!token) {
                      setPwMessage({ type: 'error', text: 'Vui lòng đăng nhập trước khi đổi mật khẩu' });
                      return;
                    }

                    try {
                      const resp = await fetch('/api/auth/change-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({
                          oldPassword: pwForm.oldPassword,
                          newPassword: pwForm.newPassword,
                        })
                      });

                      const data = await resp.json();
                      if (!resp.ok) throw new Error(data.error || 'Đổi mật khẩu thất bại');
                      setPwMessage({ type: 'success', text: data.message || 'Đổi mật khẩu thành công' });
                      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                    } catch (err) {
                      setPwMessage({ type: 'error', text: err instanceof Error ? err.message : 'Đã xảy ra lỗi' });
                    }
                  }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Mật khẩu cũ</label>
                      <input type="password" value={pwForm.oldPassword} onChange={(e) => setPwForm({...pwForm, oldPassword: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
                      <input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({...pwForm, newPassword: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu mới</label>
                      <input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({...pwForm, confirmPassword: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700">Đổi mật khẩu</button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Lịch sử đơn hàng</h2>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Đơn hàng #12345</span>
                      <span className="text-green-600">Đã giao</span>
                    </div>
                    <p className="text-gray-600">Ngày đặt: 15/11/2025</p>
                    <p className="text-gray-600">Tổng tiền: 30.000.000đ</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Địa chỉ giao hàng</h2>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <p className="font-semibold">Nguyễn Văn A</p>
                    <p>123 Đường ABC, Quận 1, TP.HCM</p>
                    <p>0123456789</p>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Mặc định</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Danh sách yêu thích</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold">iPhone 15 Pro</h3>
                    <p className="text-red-600 font-bold">30.000.000đ</p>
                    <Link href="/san-pham/1" className="text-blue-600 hover:underline">Xem chi tiết</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}