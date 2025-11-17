import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserBehavior from '@/models/UserBehavior';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, event, metadata, sessionId } = body;

    // Validate required fields
    if (!event) {
      return NextResponse.json({ error: 'Event is required' }, { status: 400 });
    }

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const behaviorData = {
      userId: userId || null, // Allow anonymous users
      event,
      metadata: metadata || {},
      sessionId,
      ipAddress,
      userAgent
    };

    const behavior = new UserBehavior(behaviorData);
    await behavior.save();

    return NextResponse.json({ message: 'Behavior tracked successfully', id: behavior._id });
  } catch (error) {
    console.error('Error tracking behavior:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const event = searchParams.get('event');
    const limit = parseInt(searchParams.get('limit') || '100');

    const query: any = {};
    if (userId) query.userId = userId;
    if (event) query.event = event;

    const behaviors = await UserBehavior.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('userId', 'name email');

    return NextResponse.json(behaviors);
  } catch (error) {
    console.error('Error fetching behaviors:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}