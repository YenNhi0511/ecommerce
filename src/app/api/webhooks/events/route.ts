import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WebhookEvent from '@/models/WebhookEvent';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getUserFromRequest(req as any);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const events = await WebhookEvent.find().sort({ receivedAt: -1 }).limit(200).lean();
  return NextResponse.json({ events });
}
