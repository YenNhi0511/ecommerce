'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

interface Event {
  _id: string;
  userId: string | null;
  sessionId: string;
  event: string;
  timestamp: Date;
  metadata: any;
  ipAddress: string;
  userAgent: string;
}

export default function EventExplorerPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: '',
    dateFrom: '',
    dateTo: '',
    sessionId: '',
    productId: ''
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.eventType) params.append('event', filters.eventType);
      if (filters.dateFrom) params.append('from', filters.dateFrom);
      if (filters.dateTo) params.append('to', filters.dateTo);
      if (filters.sessionId) params.append('sessionId', filters.sessionId);
      
      const response = await fetch(`/api/analytics/events?${params.toString()}`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('VIEW')) return '👁️';
    if (eventType.includes('CART')) return '🛒';
    if (eventType.includes('SEARCH')) return '🔍';
    if (eventType.includes('ORDER')) return '✅';
    if (eventType.includes('CLICK')) return '👆';
    return '📊';
  };

  const getEventColor = (eventType: string) => {
    if (eventType.includes('VIEW')) return 'bg-blue-100 text-blue-800';
    if (eventType.includes('CART')) return 'bg-green-100 text-green-800';
    if (eventType.includes('SEARCH')) return 'bg-purple-100 text-purple-800';
    if (eventType.includes('ORDER')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-black';
  };

  return (
    <div className="max-w-[1400px] mx-auto px-[4%] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">📋 Event Explorer</h1>
          <p className="text-black">Nhật ký chi tiết mọi hành vi người dùng</p>
        </div>
        <Link href="/admin/analytics" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          ← Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">🔍 Bộ lọc</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Loại sự kiện</label>
            <select
              value={filters.eventType}
              onChange={(e) => setFilters({...filters, eventType: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Tất cả</option>
              <option value="PRODUCT_VIEW_CATEGORY">Xem sản phẩm</option>
              <option value="CART_ADD">Thêm giỏ hàng</option>
              <option value="CART_REMOVE">Xóa giỏ hàng</option>
              <option value="SEARCH_RESULTS_VIEW">Tìm kiếm</option>
              <option value="ORDER_COMPLETE">Đặt hàng</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Từ ngày</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Đến ngày</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Session ID</label>
            <input
              type="text"
              value={filters.sessionId}
              onChange={(e) => setFilters({...filters, sessionId: e.target.value})}
              placeholder="session_xxx"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadEvents}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
          <div className="text-sm opacity-90">Tổng Events</div>
          <div className="text-3xl font-bold">{events.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
          <div className="text-sm opacity-90">Unique Sessions</div>
          <div className="text-3xl font-bold">{new Set(events.map(e => e.sessionId)).size}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4">
          <div className="text-sm opacity-90">Unique Users</div>
          <div className="text-3xl font-bold">{new Set(events.filter(e => e.userId).map(e => e.userId)).size}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4">
          <div className="text-sm opacity-90">Event Types</div>
          <div className="text-3xl font-bold">{new Set(events.map(e => e.event)).size}</div>
        </div>
      </div>

      {/* Event Charts */}
      {events.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Event Type Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4">📊 Phân bố loại sự kiện</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(() => {
                const eventCounts: { [key: string]: number } = {};
                events.forEach(e => {
                  eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
                });
                return Object.entries(eventCounts)
                  .map(([name, count]) => ({ name, count }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 10);
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Event Category Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4">🥧 Phân loại hành vi</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(() => {
                    const categories: { [key: string]: number } = {
                      'VIEW': 0,
                      'CART': 0,
                      'SEARCH': 0,
                      'ORDER': 0,
                      'OTHER': 0
                    };
                    events.forEach(e => {
                      if (e.event.includes('VIEW')) categories['VIEW']++;
                      else if (e.event.includes('CART')) categories['CART']++;
                      else if (e.event.includes('SEARCH')) categories['SEARCH']++;
                      else if (e.event.includes('ORDER')) categories['ORDER']++;
                      else categories['OTHER']++;
                    });
                    return Object.entries(categories)
                      .filter(([, count]) => count > 0)
                      .map(([name, count]) => ({ name, count }));
                  })()}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {['VIEW', 'CART', 'SEARCH', 'ORDER', 'OTHER'].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'][index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Thời gian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Chi tiết</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-black">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(event.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getEventColor(event.event)}`}>
                        {getEventIcon(event.event)} {event.event}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-black">
                      {event.sessionId.substring(0, 12)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {event.userId ? (
                        <span className="text-green-600 font-medium">Logged in</span>
                      ) : (
                        <span className="text-black">Anonymous</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {event.metadata?.productName && (
                        <div className="text-black">{event.metadata.productName}</div>
                      )}
                      {event.metadata?.query && (
                        <div className="text-black">Query: {event.metadata.query}</div>
                      )}
                      {event.metadata?.orderId && (
                        <div className="text-black">Order: {event.metadata.orderId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Xem chi tiết →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Chi tiết Event</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-black hover:text-black"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-black">Event Type</div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEventColor(selectedEvent.event)}`}>
                      {getEventIcon(selectedEvent.event)} {selectedEvent.event}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-black">Timestamp</div>
                  <div className="mt-1 text-sm">{new Date(selectedEvent.timestamp).toLocaleString('vi-VN')}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-black">Session ID</div>
                  <div className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded">{selectedEvent.sessionId}</div>
                </div>

                {selectedEvent.userId && (
                  <div>
                    <div className="text-sm font-medium text-black">User ID</div>
                    <div className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded">{selectedEvent.userId}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-black">Metadata (Properties)</div>
                  <pre className="mt-1 text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>

                <div>
                  <div className="text-sm font-medium text-black">IP Address</div>
                  <div className="mt-1 text-sm">{selectedEvent.ipAddress}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-black">User Agent</div>
                  <div className="mt-1 text-sm text-black">{selectedEvent.userAgent}</div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Link
                    href={`/admin/analytics/journey?session=${selectedEvent.sessionId}`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-700"
                  >
                    Xem Journey →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
