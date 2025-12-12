import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserBehavior from '@/models/UserBehavior';

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

    // Calculate conversion rates
    const funnel = [
      {
        stage: 'Product Views',
        count: productViews,
        percentage: 100,
        dropOff: 0,
      },
      {
        stage: 'Add to Cart',
        count: addToCarts,
        percentage: productViews > 0 ? ((addToCarts / productViews) * 100).toFixed(1) : 0,
        dropOff: productViews - addToCarts,
      },
      {
        stage: 'Checkout',
        count: checkouts,
        percentage: productViews > 0 ? ((checkouts / productViews) * 100).toFixed(1) : 0,
        dropOff: addToCarts - checkouts,
      },
      {
        stage: 'Order Complete',
        count: orders,
        percentage: productViews > 0 ? ((orders / productViews) * 100).toFixed(1) : 0,
        dropOff: checkouts - orders,
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
