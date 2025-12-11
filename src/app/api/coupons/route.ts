import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(request);
    if (user && user.role === 'admin') {
      const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json({ coupons });
    }

    // Public: only active coupons (no rate-limit details)
    const coupons = await Coupon.find({ active: true }).lean();
    return NextResponse.json({ coupons });
  } catch (err) {
    console.error('Coupons GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { code, type = 'percent', value, expiresAt, minSubtotal, maxUses } = body;
    if (!code || !value) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    await dbConnect();
    const coupon = await Coupon.create({
      code: String(code).toUpperCase(),
      type,
      value,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      minSubtotal,
      maxUses,
      active: true,
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (err) {
    console.error('Coupons POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { id, updates } = body;
    if (!id || !updates) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    await dbConnect();
    const coupon = await Coupon.findByIdAndUpdate(id, updates, { new: true });
    if (!coupon) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ coupon });
  } catch (err) {
    console.error('Coupons PUT error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await dbConnect();
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Coupons DELETE error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
