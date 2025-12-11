import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ChatMessage from '../../../../models/ChatMessage';

export async function GET(req: Request) {
  try {
    if (!process.env.MONGODB_URI) return NextResponse.json({ error: 'Missing MONGODB_URI' }, { status: 500 });
    await mongoose.connect(process.env.MONGODB_URI);
    const url = new URL(req.url);
    const since = url.searchParams.get('since');
    const query: any = {};
    if (since) query.createdAt = { $gt: new Date(since) };
    const rows = await ChatMessage.find(query).sort({ createdAt: 1 }).limit(200).lean();
    return NextResponse.json({ messages: rows });
  } catch (err: any) {
    console.error('chat GET error', err);
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.MONGODB_URI) return NextResponse.json({ error: 'Missing MONGODB_URI' }, { status: 500 });
    await mongoose.connect(process.env.MONGODB_URI);
    const body = await req.json();
    const { senderName, message, userId } = body;
    if (!senderName || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const doc = await ChatMessage.create({ senderName, message, userId });
    return NextResponse.json({ message: doc });
  } catch (err: any) {
    console.error('chat POST error', err);
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 });
  }
}
