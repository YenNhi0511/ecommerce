import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { getUserFromRequest } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '' as string, { apiVersion: '2022-11-15' as any });

const ZERO_DECIMAL = new Set(['vnd', 'jpy', 'krw']);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items = [], shippingAddress = {}, couponCode } = body;

    const user = await getUserFromRequest(request as any);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!items || !Array.isArray(items) || items.length === 0) return NextResponse.json({ error: 'No items' }, { status: 400 });

    await dbConnect();

    // validate products and compute totals
    let itemsTotal = 0;
    const orderItems: any[] = [];
    const line_items: any[] = [];
    const currency = (process.env.STRIPE_CURRENCY || 'vnd').toLowerCase();

    for (const it of items) {
      const prod = await Product.findById(it.productId);
      if (!prod) return NextResponse.json({ error: `Product not found: ${it.productId}` }, { status: 404 });
      if (prod.stock < it.quantity) return NextResponse.json({ error: `Insufficient stock for ${prod.name}` }, { status: 400 });
      // Use base/original price as product price for checkout totals
      const price = prod.originalPrice && prod.originalPrice > prod.price ? prod.originalPrice : prod.price;
      itemsTotal += price * it.quantity;
      orderItems.push({ product: prod._id, quantity: it.quantity, price });

      const unit = ZERO_DECIMAL.has(currency) ? Math.round(price) : Math.round(price * 100);
      line_items.push({
        price_data: {
          currency,
          product_data: { name: prod.name || 'Sản phẩm' },
          unit_amount: unit
        },
        quantity: Number(it.quantity || 1)
      });
    }

    // Total equals itemsTotal (no shipping fee)
    const shippingPrice = 0;
    const total = Math.max(0, itemsTotal);

    // Create order with pending paymentStatus
    const order = await Order.create({
      user: user._id,
      items: orderItems,
      itemsTotal,
      shippingFee: shippingPrice,
      totalAmount: total,
      shippingAddress: shippingAddress || {},
      paymentMethod: 'card',
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });

    // Do NOT decrement stock here; stock will be decremented when payment is confirmed (webhook)

    const origin = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // No shipping line item (shipping removed)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/xac-nhan-don-hang/${order._id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/thanh-toan`,
      metadata: { orderId: order._id.toString(), couponCode: couponCode || '' }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('create-checkout error', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
