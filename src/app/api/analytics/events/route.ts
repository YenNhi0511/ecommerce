import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserBehavior from '@/models/UserBehavior';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const event = searchParams.get('event');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query
    const query: any = {};
    
    if (event) {
      query.event = event;
    }
    
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }
    
    if (sessionId) {
      query.sessionId = sessionId;
    }

    // Get events
    const events = await UserBehavior.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ 
      events,
      total: events.length
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Events API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
