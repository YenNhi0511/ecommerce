import { NextResponse } from 'next/server';

// This endpoint is disabled in production for security
export async function POST() {
  return NextResponse.json(
    { error: 'Seed reset is disabled. Use /api/seed instead.' },
    { status: 410 }
  );
}
