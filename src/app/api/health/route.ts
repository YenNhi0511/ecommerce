import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Railway
 * Returns 200 OK if the app is running
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      timestamp: Date.now(),
      status: 'healthy'
    },
    { status: 200 }
  );
}
