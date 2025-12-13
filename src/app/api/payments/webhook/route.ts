import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import WebhookEvent from '@/models/WebhookEvent';
import { getUserFromRequest } from '@/lib/auth';

const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2022-11-15' as any }) : null;

async function handleCheckoutSession(session: any) {
  const orderId = session.metadata?.orderId;
  const couponCode = session.metadata?.couponCode;
  if (!orderId) return { ok: false, reason: 'no orderId' };

  const order: any = await Order.findById(orderId);
  if (!order) return { ok: false, reason: 'order not found' };

  order.paymentStatus = 'paid';
  order.orderStatus = 'processing';
  order.paidAt = new Date();

  if (!order.stockReserved) {
    const Product = (await import('@/models/Product')).default;
    let shortage = false;
      for (const it of order.items) {
      const prod = await Product.findById(it.product);
      if (!prod) {
        shortage = true;
        console.warn('Product not found during webhook stock decrement', it.product);
        continue;
      }
      // We now decrement by 1 per product when payment completes; require at least 1 in stock
      if (prod.stock < 1) {
        shortage = true;
        console.warn(`Insufficient stock for ${prod._id} during webhook (need >=1)`);
        continue;
      }
      await Product.findByIdAndUpdate(prod._id, { $inc: { stock: -1, sold: 1 } });
    }
    order.stockReserved = true;
    if (shortage) order.orderStatus = 'on-hold';
  }

  await order.save();

  if (couponCode) {
    try {
      const c = await Coupon.findOne({ code: couponCode.toString() });
      if (c) {
        c.usedCount = (c.usedCount || 0) + 1;
        await c.save();
      }
    } catch (e) {
      console.warn('Failed to increment coupon usedCount', e);
    }
  }
  return { ok: true };
}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') || '';
  const payload = await req.text();
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }
    
    const event: any = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    // persist raw event first
    await dbConnect();
    const ev = await WebhookEvent.create({ provider: 'stripe', eventId: event.id, type: event.type, raw: payload, metadata: event.data?.object?.metadata || {} });

    if (event.type === 'checkout.session.completed') {
      const session: any = event.data.object;
      try {
        await handleCheckoutSession(session);
        ev.processed = true;
        ev.processedAt = new Date();
        await ev.save();
      } catch (e: any) {
        ev.error = String(e?.message || e);
        await ev.save();
        console.error('processing checkout.session.completed failed', e);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    // attempt to persist failed parsing
    try { await dbConnect(); await WebhookEvent.create({ provider: 'stripe', eventId: null, type: 'invalid', raw: payload, error: String(err?.message || err) }); } catch (e) {}
    console.error('webhook error', err);
    return NextResponse.json({ error: err.message || 'Webhook error' }, { status: 400 });
  }
}
