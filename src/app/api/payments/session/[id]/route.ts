import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '' as string, { apiVersion: '2022-11-15' as any });

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const sessionId = parts.pop();
    if (!sessionId) return NextResponse.json({ error: 'Missing session id' }, { status: 400 });

    // retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId as string, { expand: ['payment_intent'] });
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    // If payment succeeded, update order accordingly
    const metadata: any = (session as any).metadata || {};
    const orderId = metadata.orderId;

    await dbConnect();

    if (session.payment_status === 'paid' && orderId) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid', orderStatus: 'processing', paidAt: new Date() });
    }

    return NextResponse.json({ session, updated: session.payment_status === 'paid' });
  } catch (err: any) {
    console.error('verify session error', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
