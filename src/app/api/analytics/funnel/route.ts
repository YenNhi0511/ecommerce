import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserBehavior from '@/models/UserBehavior';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get date range
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Calculate funnel stages
    const [productViews, addToCarts, checkouts, orders] = await Promise.all([
      // Stage 1: Product Views
      UserBehavior.distinct('sessionId', {
        event: { $in: ['PRODUCT_VIEW_HOME', 'PRODUCT_VIEW_CATEGORY', 'PRODUCT_VIEW_SEARCH', 'PRODUCT_VIEW_BANNER'] },
        timestamp: { $gte: startDate }
      }).then(arr => arr.length),

      // Stage 2: Add to Cart
      UserBehavior.distinct('sessionId', {
        event: 'CART_ADD',
        timestamp: { $gte: startDate }
      }).then(arr => arr.length),

      // Stage 3: Checkout Started (approximated by cart view)
      UserBehavior.distinct('sessionId', {
        event: 'UI_CLICK_CART_ICON',
        timestamp: { $gte: startDate }
      }).then(arr => arr.length),

      // Stage 4: Order Complete
      UserBehavior.distinct('sessionId', {
        event: 'ORDER_COMPLETE',
        timestamp: { $gte: startDate }
      }).then(arr => arr.length),
    ]);

    // Calculate conversion rates properly
    const funnel = [
      {
        stage: 'Lượt Xem Sản Phẩm',
        count: productViews,
        percentage: productViews > 0 ? 100 : 0, // Always 100% if exists
        dropOff: productViews - addToCarts,
        dropOffPercentage: productViews > 0 ? (((productViews - addToCarts) / productViews) * 100).toFixed(1) : 0,
      },
      {
        stage: 'Thêm Vào Giỏ',
        count: addToCarts,
        percentage: productViews > 0 ? parseFloat(((addToCarts / productViews) * 100).toFixed(1)) : 0,
        dropOff: addToCarts - checkouts,
        dropOffPercentage: addToCarts > 0 ? (((addToCarts - checkouts) / addToCarts) * 100).toFixed(1) : 0,
      },
      {
        stage: 'Thanh Toán',
        count: checkouts,
        percentage: productViews > 0 ? parseFloat(((checkouts / productViews) * 100).toFixed(1)) : 0,
        dropOff: checkouts - orders,
        dropOffPercentage: checkouts > 0 ? (((checkouts - orders) / checkouts) * 100).toFixed(1) : 0,
      },
      {
        stage: 'Hoàn Tất Đơn',
        count: orders,
        percentage: productViews > 0 ? parseFloat(((orders / productViews) * 100).toFixed(1)) : 0,
        dropOff: 0, // Final stage has no dropoff
        dropOffPercentage: 0,
      },
    ];

    return NextResponse.json({ funnel });

  } catch (error: any) {
    console.error('Analytics funnel error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch funnel data' },
      { status: 500 }
    );
  }
}
