"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

type AnalyticsData = {
  overview: {
    totalEvents: number;
    uniqueUsers: number;
    productViews: number;
    addToCarts: number;
    orders: number;
    conversionRate: string;
  };
  topProducts: Array<{
    _id: string;
    count: number;
    productName: string;
  }>;
  topSearches: Array<{
    _id: string;
    count: number;
  }>;
};

type FunnelData = {
  funnel: Array<{
    stage: string;
    count: number;
    percentage: number | string;
    dropOff: number;
  }>;
};

const ANALYTICS_FEATURES = [
  { icon: '📊', title: 'Dashboard', desc: 'Tổng quan', href: '/admin/analytics', color: 'from-blue-500 to-blue-600' },
  { icon: '📝', title: 'Events', desc: 'Danh sách sự kiện', href: '/admin/analytics/events', color: 'from-green-500 to-green-600' },
  { icon: '🗺️', title: 'Journey', desc: 'Hành trình người dùng', href: '/admin/analytics/journey', color: 'from-purple-500 to-purple-600' },
  { icon: '📉', title: 'Funnel', desc: 'Phễu chuyển đổi', href: '/admin/analytics/funnel', color: 'from-orange-500 to-orange-600' },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewRes, funnelRes, timelineRes] = await Promise.all([
        fetch(`/api/analytics/overview?days=${timeRange}`),
        fetch(`/api/analytics/funnel?days=${timeRange}`),
        fetch(`/api/analytics/timeline?days=${timeRange}`),
      ]);

      const overviewData = await overviewRes.json();
      const funnelDataRes = await funnelRes.json();
      const timelineDataRes = await timelineRes.json();

      if (overviewRes.ok) {
        setData(overviewData);
      } else {
        setError(overviewData.error || 'Không thể tải dữ liệu');
      }

      if (funnelRes.ok) {
        setFunnelData(funnelDataRes);
      }

      if (timelineRes.ok) {
        setTimelineData(timelineDataRes.data || []);
      }
    } catch (e: any) {
      setError(e?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-[4%] p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">📊 Bảng Điều Khiển Phân Tích</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value={1}>24 giờ qua</option>
          <option value={7}>7 ngày qua</option>
          <option value={30}>30 ngày qua</option>
          <option value={90}>90 ngày qua</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Feature Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {ANALYTICS_FEATURES.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className={`bg-gradient-to-br ${feature.color} text-white p-6 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1`}
          >
            <div className="text-4xl mb-2">{feature.icon}</div>
            <div className="text-xl font-bold">{feature.title}</div>
            <div className="text-sm opacity-90">{feature.desc}</div>
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải dữ liệu...</div>
      ) : data ? (
        <>
          {/* Timeline Chart */}
          {timelineData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">📈 Xu hướng sự kiện theo thời gian</h2>
              
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {timelineData.reduce((sum, d) => sum + (d.total || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-600">Tổng sự kiện</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {timelineData.reduce((sum, d) => sum + (d.views || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-600">Lượt xem</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {timelineData.reduce((sum, d) => sum + (d.carts || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-600">Giỏ hàng</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {timelineData.reduce((sum, d) => sum + (d.orders || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-600">Đơn hàng</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {timelineData.reduce((sum, d) => sum + (d.searches || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-600">Tìm kiếm</div>
                </div>
              </div>

              {/* Stock-style Area Chart */}
              <ResponsiveContainer width="100%" height={500}>
                <AreaChart 
                  data={timelineData} 
                  margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCarts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#e5e7eb" 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    tickLine={false}
                    axisLine={{ stroke: '#d1d5db' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#d1d5db' }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                      padding: '16px'
                    }}
                    labelStyle={{ 
                      fontWeight: '700', 
                      marginBottom: '12px',
                      color: '#111827',
                      fontSize: '14px'
                    }}
                    itemStyle={{
                      padding: '4px 0',
                      fontSize: '13px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      paddingTop: '30px',
                      fontSize: '13px'
                    }}
                    iconType="line"
                    iconSize={24}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#3B82F6" 
                    strokeWidth={2.5}
                    fill="url(#colorViews)"
                    name="👁️ Xem" 
                    dot={false}
                    activeDot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="searches" 
                    stroke="#F59E0B" 
                    strokeWidth={2.5}
                    fill="url(#colorSearches)"
                    name="🔍 Tìm kiếm" 
                    dot={false}
                    activeDot={{ r: 6, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="carts" 
                    stroke="#10B981" 
                    strokeWidth={2.5}
                    fill="url(#colorCarts)"
                    name="🛒 Giỏ hàng" 
                    dot={false}
                    activeDot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#EF4444" 
                    strokeWidth={2.5}
                    fill="url(#colorOrders)"
                    name="✅ Đơn hàng" 
                    dot={false}
                    activeDot={{ r: 6, fill: '#EF4444', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow">
              <div className="text-sm opacity-90">Tổng Sự Kiện</div>
              <div className="text-3xl font-bold mt-2">{data.overview.totalEvents.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow">
              <div className="text-sm opacity-90">Người Dùng</div>
              <div className="text-3xl font-bold mt-2">{data.overview.uniqueUsers.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow">
              <div className="text-sm opacity-90">Lượt Xem</div>
              <div className="text-3xl font-bold mt-2">{data.overview.productViews.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 rounded-lg shadow">
              <div className="text-sm opacity-90">Thêm Giỏ Hàng</div>
              <div className="text-3xl font-bold mt-2">{data.overview.addToCarts.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow">
              <div className="text-sm opacity-90">Đơn Hàng</div>
              <div className="text-3xl font-bold mt-2">{data.overview.orders.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg shadow">
              <div className="text-sm opacity-90">Tỷ Lệ Chuyển Đổi</div>
              <div className="text-3xl font-bold mt-2">{data.overview.conversionRate}%</div>
            </div>
          </div>

          {/* Conversion Funnel */}
          {funnelData && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">🔄 Phễu Chuyển Đổi</h2>
              <div className="space-y-3">
                {funnelData.funnel.map((stage, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{stage.stage}</span>
                      <span className="text-sm text-gray-600">
                        {stage.count.toLocaleString()} ({typeof stage.percentage === 'string' ? stage.percentage : stage.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${typeof stage.percentage === 'string' ? stage.percentage : stage.percentage.toFixed(1)}%` }}
                      >
                        {stage.count > 0 && (
                          <span className="absolute left-3 top-1 text-white font-semibold text-sm">
                            {stage.count.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Show drop-off ONLY if not last stage and has drop-off */}
                    {index < funnelData.funnel.length - 1 && stage.dropOff > 0 && (
                      <div className="text-xs text-red-600 mt-1">
                        ⚠️ Drop-off: {stage.dropOff.toLocaleString()} users ({((stage.dropOff / stage.count) * 100).toFixed(1)}%)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Products Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">🔥 Sản Phẩm Xem Nhiều Nhất</h2>
              {data.topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="productName" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3B82F6" name="Lượt xem" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500 text-center py-12">Chưa có dữ liệu</div>
              )}
            </div>

            {/* Top Searches Pie Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">🔍 Từ Khóa Tìm Kiếm Hàng Đầu</h2>
              {data.topSearches.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.topSearches}
                      dataKey="count"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.topSearches.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500 text-center py-12">Chưa có dữ liệu</div>
              )}
            </div>
          </div>

          {/* Event Type Distribution */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">📊 Phân Bố Loại Sự Kiện</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Lượt Xem', count: data.overview.productViews, fill: '#3B82F6' },
                { name: 'Thêm Giỏ Hàng', count: data.overview.addToCarts, fill: '#10B981' },
                { name: 'Đơn Hàng', count: data.overview.orders, fill: '#EF4444' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Mẹo Phân Tích</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Theo dõi tự động: Tất cả hành vi người dùng đang được ghi nhận</li>
              <li>• Dữ liệu thời gian thực: Cập nhật mỗi khi người dùng tương tác</li>
              <li>• Phễu chuyển đổi: Theo dõi tỷ lệ chuyển đổi qua từng bước</li>
              <li>• Sản phẩm hàng đầu: Xác định sản phẩm hot để tối ưu kho hàng</li>
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
