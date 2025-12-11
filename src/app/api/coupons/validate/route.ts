import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;
    if (!code) return NextResponse.json({ error: 'Missing coupon code' }, { status: 400 });

    await dbConnect();
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon || !coupon.active) return NextResponse.json({ valid: false, error: 'Mã không hợp lệ' });

    if (coupon.expiresAt && coupon.expiresAt < new Date()) return NextResponse.json({ valid: false, error: 'Mã đã hết hạn' });
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return NextResponse.json({ valid: false, error: 'Tổng đơn không đạt điều kiện áp dụng' });
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ valid: false, error: 'Mã đã hết lượt sử dụng' });

    // compute discount
    let discount = 0;
    if (coupon.type === 'percent') {
      discount = Math.round((subtotal * (coupon.value / 100)));
    } else {
      discount = coupon.value;
    }

    return NextResponse.json({ valid: true, discount, coupon: { code: coupon.code, type: coupon.type, value: coupon.value } });
  } catch (err) {
    console.error('Coupon validate error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
