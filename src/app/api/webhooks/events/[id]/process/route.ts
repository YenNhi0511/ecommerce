import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WebhookEvent from '@/models/WebhookEvent';
import { getUserFromRequest } from '@/lib/auth';
import Stripe from 'stripe';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';

const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2022-11-15' as any }) : null;

async function processEvent(ev: any) {
  // Only support replay for checkout.session.completed
  try {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    const parsed = JSON.parse(ev.raw || '{}');
    const type = ev.type || parsed.type;
    if (type === 'checkout.session.completed' || parsed.type === 'checkout.session.completed') {
      const session = parsed.data?.object || parsed;
      // fresh retrieve session from Stripe to ensure latest status
      const sessionId = session.id;
      if (!sessionId) throw new Error('No session id');
      const s = await stripe.checkout.sessions.retrieve(sessionId as string, { expand: ['payment_intent'] });
      // replicate logic from webhook handler
      const orderId = s.metadata?.orderId;
      if (!orderId) throw new Error('No orderId in session metadata');
      const order: any = await Order.findById(orderId);
      if (!order) throw new Error('Order not found');

      order.paymentStatus = s.payment_status === 'paid' ? 'paid' : order.paymentStatus;
      if (s.payment_status === 'paid') {
        order.orderStatus = 'processing';
        order.paidAt = new Date();
        if (!order.stockReserved) {
          const Product = (await import('@/models/Product')).default;
          let shortage = false;
          for (const it of order.items) {
            const prod = await Product.findById(it.product);
            if (!prod) {
              shortage = true;
              console.warn('Product not found during replay stock decrement', it.product);
              continue;
            }
            if (prod.stock < 1) {
              shortage = true;
              console.warn(`Insufficient stock for ${prod._id} during replay (need >=1)`);
              continue;
            }
            await Product.findByIdAndUpdate(it.product, { $inc: { stock: -1, sold: 1 } });
          }
          if (!shortage) order.stockReserved = true;
        }
        await order.save();
      }
      // coupon handling
      const couponCode = s.metadata?.couponCode;
      if (couponCode) {
        const c = await Coupon.findOne({ code: couponCode.toString() });
        if (c) { c.usedCount = (c.usedCount || 0) + 1; await c.save(); }
      }
      return { ok: true };
    }
    return { ok: false, reason: 'unsupported' };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request as any);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const parts = new URL(request.url).pathname.split('/');
  const id = parts[parts.length - 1];
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const ev = await WebhookEvent.findById(id);
  if (!ev) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const res = await processEvent(ev);
  ev.processed = res.ok;
  ev.processedAt = new Date();
  if (!res.ok) ev.error = res.error || res.reason || 'failed';
  await ev.save();
  return NextResponse.json({ result: res });
}
