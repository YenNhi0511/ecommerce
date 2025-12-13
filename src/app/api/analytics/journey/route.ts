import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserBehavior from '@/models/UserBehavior';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Get all events for this session
    const events = await UserBehavior.find({ sessionId })
      .sort({ timestamp: 1 }) // Chronological order
      .lean();

    // Calculate session info
    const sessionInfo = {
      sessionId,
      totalEvents: events.length,
      startTime: events.length > 0 ? events[0].timestamp : null,
      endTime: events.length > 0 ? events[events.length - 1].timestamp : null,
      durationSeconds: events.length > 1 
        ? Math.round((new Date(events[events.length - 1].timestamp).getTime() - new Date(events[0].timestamp).getTime()) / 1000)
        : 0,
      hasOrder: events.some(e => e.event === 'ORDER_COMPLETE'),
      productsViewed: new Set(events.filter(e => e.metadata?.productId).map(e => e.metadata.productId)).size,
      searches: events.filter(e => e.event.includes('SEARCH')).length,
      cartAdds: events.filter(e => e.event === 'CART_ADD').length
    };

    return NextResponse.json({ 
      events,
      sessionInfo
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Journey API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch journey' },
      { status: 500 }
    );
  }
}
