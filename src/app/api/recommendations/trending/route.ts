import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import UserBehavior from '@/models/UserBehavior';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const days = parseInt(searchParams.get('days') || '7');

    // Get trending products (most viewed in last N days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trendingProductIds = await UserBehavior.aggregate([
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
          views: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 1,
          views: 1,
          uniqueUsersCount: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: limit }
    ]);

    // Get product details
    const productIds = trendingProductIds.map(p => p._id);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true
    });

    // Merge with view counts
    const productsWithStats = products.map(product => {
      const stats = trendingProductIds.find(t => t._id === product._id.toString());
      return {
        ...product.toObject(),
        trendingStats: {
          views: stats?.views || 0,
          uniqueUsers: stats?.uniqueUsersCount || 0
        }
      };
    });

    return NextResponse.json({ 
      trending: productsWithStats,
      timeRange: `${days} days`
    });

  } catch (error: any) {
    console.error('Trending products error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get trending products' },
      { status: 500 }
    );
  }
}
