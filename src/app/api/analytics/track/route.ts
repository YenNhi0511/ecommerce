import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserBehavior from '@/models/UserBehavior';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, event, sessionId, metadata, deviceInfo } = body;

    // Validate event type
    if (!event) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }

    // Validate sessionId
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Try to connect to DB with timeout
    try {
      await Promise.race([
        connectDB(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('DB connection timeout')), 5000)
        )
      ]);
    } catch (dbError) {
      console.error('MongoDB connection failed, analytics not saved:', dbError);
      // Return success to not block UI, but log the error
      return NextResponse.json({ 
        success: false, 
        message: 'Analytics tracking temporarily unavailable'
      }, { status: 200 }); // Return 200 to not show error in UI
    }

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
    // Return success to not block UI
    return NextResponse.json(
      { success: false, message: 'Failed to track event' },
      { status: 200 }
    );
  }
}
