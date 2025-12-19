'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Event {
  _id: string;
  event: string;
  timestamp: Date;
  metadata: any;
}

function JourneyContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      loadJourney();
    }
  }, [sessionId]);

  const loadJourney = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/journey?sessionId=${sessionId}`);
      const data = await response.json();
      setEvents(data.events || []);
      setSessionInfo(data.sessionInfo || {});
    } catch (error) {
      console.error('Error loading journey:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('VIEW')) return '👁️';
    if (eventType.includes('CART_ADD')) return '🛒';
    if (eventType.includes('CART_REMOVE')) return '🗑️';
    if (eventType.includes('SEARCH')) return '🔍';
    if (eventType.includes('ORDER')) return '✅';
    if (eventType.includes('CLICK')) return '👆';
    return '📊';
  };

  const getStepColor = (index: number, total: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-pink-500'
    ];
    return colors[index % colors.length];
  };

  if (!sessionId) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold mb-2">Chưa chọn Session</h3>
        <p className="text-black mb-4">Vui lòng chọn session từ Event Explorer</p>
        <Link href="/admin/analytics/events" className="text-blue-600 hover:underline">
          ← Quay lại Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-[4%] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">🗺️ User Journey</h1>
          <p className="text-black">Hành trình của người dùng</p>
        </div>
        <Link href="/admin/analytics/events" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          ← Events
        </Link>
      </div>

      {/* Session Info */}
      {sessionInfo && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">📋 Thông tin Session</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-black">Session ID</div>
              <div className="font-mono text-sm mt-1">{sessionId?.substring(0, 20)}...</div>
            </div>
            <div>
              <div className="text-sm text-black">Tổng Events</div>
              <div className="text-2xl font-bold text-blue-600">{events.length}</div>
            </div>
            <div>
              <div className="text-sm text-black">Thời gian</div>
              <div className="text-sm mt-1">
                {events.length > 0 && (
                  <>
                    {new Date(events[events.length - 1].timestamp).toLocaleTimeString('vi-VN')}
                    {' - '}
                    {new Date(events[0].timestamp).toLocaleTimeString('vi-VN')}
                  </>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-black">Trạng thái</div>
              <div className="mt-1">
                {events.some(e => e.event === 'ORDER_COMPLETE') ? (
                  <span className="text-green-600 font-bold">✅ Đã mua</span>
                ) : events.some(e => e.event.includes('CART')) ? (
                  <span className="text-orange-600 font-bold">🛒 Có giỏ hàng</span>
                ) : (
                  <span className="text-black">👁️ Đang xem</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Journey Timeline */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Đang tải journey...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold mb-2">Không có dữ liệu</h3>
          <p className="text-black">Session này chưa có events</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-6">⏱️ Timeline</h3>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Events */}
            <div className="space-y-6">
              {events.map((event, index) => (
                <div key={event._id} className="relative pl-20">
                  {/* Step number */}
                  <div className={`absolute left-0 w-16 h-16 ${getStepColor(index, events.length)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {index + 1}
                  </div>
                  
                  {/* Event card */}
                  <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getEventIcon(event.event)}</span>
                        <span className="font-bold text-lg">{event.event}</span>
                      </div>
                      <div className="text-sm text-black">
                        {new Date(event.timestamp).toLocaleTimeString('vi-VN')}
                      </div>
                    </div>
                    
                    {/* Event details */}
                    {event.metadata && (
                      <div className="mt-3 space-y-2">
                        {event.metadata.productName && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-black">Sản phẩm:</span>
                            <span className="text-sm text-blue-600">{event.metadata.productName}</span>
                          </div>
                        )}
                        {event.metadata.query && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-black">Tìm kiếm:</span>
                            <span className="text-sm text-purple-600">"{event.metadata.query}"</span>
                          </div>
                        )}
                        {event.metadata.price && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-black">Giá:</span>
                            <span className="text-sm text-green-600">{event.metadata.price.toLocaleString()}₫</span>
                          </div>
                        )}
                        {event.metadata.quantity && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-black">Số lượng:</span>
                            <span className="text-sm">{event.metadata.quantity}</span>
                          </div>
                        )}
                        {event.metadata.resultsCount !== undefined && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-black">Kết quả:</span>
                            <span className="text-sm">{event.metadata.resultsCount} sản phẩm</span>
                          </div>
                        )}
                        {event.metadata.totalAmount && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-black">Tổng tiền:</span>
                            <span className="text-sm text-red-600 font-bold">{event.metadata.totalAmount.toLocaleString()}₫</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Time difference to next event */}
                  {index < events.length - 1 && (
                    <div className="absolute left-8 -bottom-3 bg-white px-2 py-1 text-xs text-black border rounded">
                      ⏱️ {Math.round((new Date(events[index].timestamp).getTime() - new Date(events[index + 1].timestamp).getTime()) / 1000)}s
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-8 pt-6 border-t">
            <h4 className="font-bold mb-4">📊 Tổng kết</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-black">Tổng thời gian</div>
                <div className="text-2xl font-bold text-blue-600">
                  {events.length > 1 ? (
                    <>
                      {Math.round((new Date(events[0].timestamp).getTime() - new Date(events[events.length - 1].timestamp).getTime()) / 60000)} phút
                    </>
                  ) : '< 1 phút'}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-black">Sản phẩm xem</div>
                <div className="text-2xl font-bold text-green-600">
                  {events.filter(e => e.event.includes('VIEW')).length}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-black">Thêm giỏ</div>
                <div className="text-2xl font-bold text-purple-600">
                  {events.filter(e => e.event === 'CART_ADD').length}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-black">Kết quả</div>
                <div className="text-xl font-bold text-red-600">
                  {events.some(e => e.event === 'ORDER_COMPLETE') ? '✅ Đã mua' : '❌ Chưa mua'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserJourneyPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    }>
      <JourneyContent />
    </Suspense>
  );
}
