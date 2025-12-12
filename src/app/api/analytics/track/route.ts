import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserBehavior from '@/models/UserBehavior';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, event, sessionId, metadata, deviceInfo } = body;

    if (!event) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get IP address
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';

    // Get user agent
    const userAgent = req.headers.get('user-agent') || '';

    // Create behavior record
    const behavior = await UserBehavior.create({
      userId: userId || null,
      event,
      sessionId: sessionId || `session_${Date.now()}`,
      timestamp: new Date(),
      metadata: metadata || {},
      ipAddress: ip,
      userAgent: deviceInfo?.userAgent || userAgent,
    });

    return NextResponse.json({ 
      success: true, 
      id: behavior._id 
    });

  } catch (error: any) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
