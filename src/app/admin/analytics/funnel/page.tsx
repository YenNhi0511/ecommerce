'use client';

import { useState, useEffect } from 'react';

interface FunnelStep {
  event: string;
  label: string;
  count: number;
  conversionRate: number;
  dropoffRate: number;
}

const EVENT_OPTIONS = [
  { value: 'PRODUCT_VIEW_LIST', label: 'Xem danh sách sản phẩm' },
  { value: 'PRODUCT_VIEW_DETAIL', label: 'Xem chi tiết sản phẩm' },
  { value: 'CART_ADD', label: 'Thêm vào giỏ' },
  { value: 'CART_VIEW', label: 'Xem giỏ hàng' },
  { value: 'CHECKOUT_START', label: 'Bắt đầu thanh toán' },
  { value: 'ORDER_COMPLETE', label: 'Hoàn tất đơn hàng' },
  { value: 'SEARCH', label: 'Tìm kiếm' },
];

export default function FunnelPage() {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'PRODUCT_VIEW_LIST',
    'PRODUCT_VIEW_DETAIL',
    'CART_ADD',
    'ORDER_COMPLETE'
  ]);
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadFunnel();
  }, [selectedEvents, timeRange]);

  const loadFunnel = async () => {
    if (selectedEvents.length < 2) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/funnel/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: selectedEvents, timeRange })
      });
      const data = await response.json();
      setFunnelData(data.steps || []);
    } catch (error) {
      console.error('Error loading funnel:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    const availableEvents = EVENT_OPTIONS.filter(opt => !selectedEvents.includes(opt.value));
    if (availableEvents.length > 0) {
      setSelectedEvents([...selectedEvents, availableEvents[0].value]);
    }
  };

  const removeStep = (index: number) => {
    setSelectedEvents(selectedEvents.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, newValue: string) => {
    const newEvents = [...selectedEvents];
    newEvents[index] = newValue;
    setSelectedEvents(newEvents);
  };

  const getStepWidth = (step: FunnelStep, maxCount: number) => {
    return Math.max(20, (step.count / maxCount) * 100);
  };

  const maxCount = funnelData.length > 0 ? funnelData[0].count : 0;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📊 Phễu Chuyển Đổi</h1>
        <p className="text-gray-600">Tạo và phân tích funnel tùy chỉnh</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">🎯 Cấu hình Funnel</h3>
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="24h">24 giờ qua</option>
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua</option>
              <option value="all">Tất cả</option>
            </select>
            <button
              onClick={loadFunnel}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🔄 Làm mới
            </button>
          </div>
        </div>

        {/* Funnel Builder */}
        <div className="space-y-3">
          {selectedEvents.map((event, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <select
                value={event}
                onChange={(e) => updateStep(index, e.target.value)}
                className="flex-1 border rounded px-3 py-2"
              >
                {EVENT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {selectedEvents.length > 2 && (
                <button
                  onClick={() => removeStep(index)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded"
                >
                  ❌
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addStep}
          disabled={selectedEvents.length >= EVENT_OPTIONS.length}
          className="mt-4 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ➕ Thêm bước
        </button>
      </div>

      {/* Funnel Visualization */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang phân tích funnel...</p>
        </div>
      ) : funnelData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold mb-2">Chưa có dữ liệu</h3>
          <p className="text-gray-600">Chọn các bước và nhấn Làm mới để xem funnel</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Funnel Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-6">📉 Trực quan hóa</h3>
            <div className="space-y-4">
              {funnelData.map((step, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-700">{index + 1}.</span>
                      <span className="font-medium">{step.label}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {step.count.toLocaleString()} users
                      {index > 0 && (
                        <span className="ml-2 text-green-600">
                          ({step.conversionRate.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Funnel bar */}
                  <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' :
                        index === 3 ? 'bg-orange-500' :
                        'bg-red-500'
                      } transition-all duration-500 flex items-center justify-center text-white font-bold`}
                      style={{ width: `${getStepWidth(step, maxCount)}%` }}
                    >
                      {step.count > 0 && `${step.count.toLocaleString()}`}
                    </div>
                  </div>

                  {/* Dropoff */}
                  {index < funnelData.length - 1 && step.dropoffRate > 0 && (
                    <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      ⚠️ <span className="font-medium">{step.dropoffRate.toFixed(1)}%</span> rời bỏ ở bước này
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
              <div className="text-sm opacity-90">Tổng số người bắt đầu</div>
              <div className="text-3xl font-bold mt-2">{funnelData[0]?.count.toLocaleString() || 0}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
              <div className="text-sm opacity-90">Hoàn thành</div>
              <div className="text-3xl font-bold mt-2">
                {funnelData[funnelData.length - 1]?.count.toLocaleString() || 0}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow">
              <div className="text-sm opacity-90">Tỷ lệ chuyển đổi</div>
              <div className="text-3xl font-bold mt-2">
                {funnelData.length > 0 && maxCount > 0
                  ? ((funnelData[funnelData.length - 1].count / maxCount) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow">
              <div className="text-sm opacity-90">Tổng rời bỏ</div>
              <div className="text-3xl font-bold mt-2">
                {maxCount > 0 && funnelData.length > 0
                  ? (maxCount - funnelData[funnelData.length - 1].count).toLocaleString()
                  : 0}
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4">📋 Chi tiết từng bước</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Bước</th>
                  <th className="text-left py-3 px-4">Sự kiện</th>
                  <th className="text-right py-3 px-4">Số người</th>
                  <th className="text-right py-3 px-4">Tỷ lệ chuyển đổi</th>
                  <th className="text-right py-3 px-4">Tỷ lệ rời bỏ</th>
                </tr>
              </thead>
              <tbody>
                {funnelData.map((step, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-700">{index + 1}</td>
                    <td className="py-3 px-4">{step.label}</td>
                    <td className="py-3 px-4 text-right font-medium">{step.count.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      {index === 0 ? (
                        <span className="text-gray-400">-</span>
                      ) : (
                        <span className="text-green-600 font-medium">{step.conversionRate.toFixed(1)}%</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {index === funnelData.length - 1 ? (
                        <span className="text-gray-400">-</span>
                      ) : (
                        <span className="text-red-600 font-medium">{step.dropoffRate.toFixed(1)}%</span>
                      )}
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
