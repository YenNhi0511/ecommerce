import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user: any = await getUserFromRequest(request as any);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const order: any = await Order.findById(id).populate('items.product').populate('user').lean();
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Authorization: admin can access any, seller can access if they own any product in order, customer can access own
    if (user.role === 'admin') return NextResponse.json({ order });

    if (user.role === 'seller') {
      // check if seller has any product in order
      const sellerProducts = await (await import('@/models/Product')).default.find({ createdBy: user._id }).select('_id').lean();
      const sellerProductIds = sellerProducts.map((p: any) => String(p._id));
      const intersects = order.items.some((it: any) => {
        const prod = it.product;
        const prodId = prod ? (prod._id ? String(prod._id) : String(prod)) : null;
        return prodId ? sellerProductIds.includes(prodId) : false;
      });
      if (!intersects) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      return NextResponse.json({ order });
    }

    // customer: support when order.user is populated object or just an id
    const orderUserId = order.user ? (order.user._id ? String(order.user._id) : String(order.user)) : null;
    const currentUserId = user._id ? String(user._id) : String((user as any).id || user);
    if (!orderUserId || orderUserId !== currentUserId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ order });
  } catch (err: any) {
    console.error('Get order error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
