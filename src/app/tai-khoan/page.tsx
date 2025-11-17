'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');

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
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Họ tên</label>
                    <input
                      type="text"
                      defaultValue="Nguyễn Văn A"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue="nguyenvana@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      defaultValue="0123456789"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Cập nhật
                  </button>
                </form>
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