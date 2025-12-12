import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserBehavior from '@/models/UserBehavior';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { events, timeRange } = body;

    if (!events || !Array.isArray(events) || events.length < 2) {
      return NextResponse.json({ error: 'At least 2 events required' }, { status: 400 });
    }

    // Calculate time filter
    let timeFilter = {};
    const now = new Date();
    if (timeRange === '24h') {
      timeFilter = { timestamp: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
    } else if (timeRange === '7d') {
      timeFilter = { timestamp: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeRange === '30d') {
      timeFilter = { timestamp: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
    }

    // Get labels for events
    const eventLabels: { [key: string]: string } = {
      'PRODUCT_VIEW_LIST': 'Xem danh sách sản phẩm',
      'PRODUCT_VIEW_DETAIL': 'Xem chi tiết sản phẩm',
      'CART_ADD': 'Thêm vào giỏ',
      'CART_VIEW': 'Xem giỏ hàng',
      'CHECKOUT_START': 'Bắt đầu thanh toán',
      'ORDER_COMPLETE': 'Hoàn tất đơn hàng',
      'SEARCH': 'Tìm kiếm',
    };

    // Build funnel steps
    const steps = [];
    let previousCount = 0;

    for (let i = 0; i < events.length; i++) {
      const eventType = events[i];
      
      // Count unique sessions that reached this step
      let query: any = { event: eventType, ...timeFilter };
      
      // If not first step, only count sessions that completed previous steps
      if (i > 0) {
        // Get sessions from previous step
        const prevSessions = await UserBehavior.distinct('sessionId', {
          event: events[i - 1],
          ...timeFilter
        });
        
        // Filter current step by those sessions
        query.sessionId = { $in: prevSessions };
      }

      const count = await UserBehavior.distinct('sessionId', query).then(sessions => sessions.length);

      // Calculate conversion and dropoff rates
      const conversionRate = i === 0 ? 100 : previousCount > 0 ? (count / previousCount) * 100 : 0;
      const dropoffRate = i === 0 ? 0 : previousCount > 0 ? ((previousCount - count) / previousCount) * 100 : 0;

      steps.push({
        event: eventType,
        label: eventLabels[eventType] || eventType,
        count,
        conversionRate,
        dropoffRate
      });

      previousCount = count;
    }

    return NextResponse.json({ steps });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Custom funnel API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to build funnel' },
      { status: 500 }
    );
  }
}
