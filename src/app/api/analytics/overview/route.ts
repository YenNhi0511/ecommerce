import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserBehavior from '@/models/UserBehavior';
import Order from '@/models/Order';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get date range from query params
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aggregate analytics data
    const [
      totalEvents,
      uniqueUsers,
      productViews,
      addToCarts,
      orders,
      topProducts,
      topSearches,
    ] = await Promise.all([
      // Total events
      UserBehavior.countDocuments({ timestamp: { $gte: startDate } }),

      // Unique users
      UserBehavior.distinct('userId', { 
        timestamp: { $gte: startDate },
        userId: { $ne: null }
      }).then(arr => arr.length),

      // Product views
      UserBehavior.countDocuments({ 
        event: { $in: ['PRODUCT_VIEW_HOME', 'PRODUCT_VIEW_CATEGORY', 'PRODUCT_VIEW_SEARCH', 'PRODUCT_VIEW_BANNER'] },
        timestamp: { $gte: startDate }
      }),

      // Add to carts
      UserBehavior.countDocuments({ 
        event: 'CART_ADD',
        timestamp: { $gte: startDate }
      }),

      // Orders
      Order.countDocuments({ createdAt: { $gte: startDate } }),

      // Top viewed products
      UserBehavior.aggregate([
        {
          $match: {
            event: { $in: ['PRODUCT_VIEW_HOME', 'PRODUCT_VIEW_CATEGORY', 'PRODUCT_VIEW_SEARCH', 'PRODUCT_VIEW_BANNER'] },
            timestamp: { $gte: startDate },
            'metadata.productId': { $exists: true }
          }
        },
        {
          $group: {
            _id: '$metadata.productId',
            count: { $sum: 1 },
            productName: { $first: '$metadata.productName' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Top searches
      UserBehavior.aggregate([
        {
          $match: {
            event: 'SEARCH_RESULTS_VIEW',
            timestamp: { $gte: startDate },
            'metadata.searchQuery': { $exists: true }
          }
        },
        {
          $group: {
            _id: '$metadata.searchQuery',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
    ]);

    // Calculate conversion rate
    const conversionRate = productViews > 0 
      ? ((orders / productViews) * 100).toFixed(2) 
      : 0;

    return NextResponse.json({
      overview: {
        totalEvents,
        uniqueUsers,
        productViews,
        addToCarts,
        orders,
        conversionRate,
      },
      topProducts,
      topSearches,
    });

  } catch (error: any) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
