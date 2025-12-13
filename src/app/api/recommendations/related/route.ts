import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserBehavior from '@/models/UserBehavior';
import Product from '@/models/Product';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Collaborative Filtering: Find users who viewed this product
    const usersWhoViewed = await UserBehavior.distinct('userId', {
      event: { $in: ['PRODUCT_VIEW_HOME', 'PRODUCT_VIEW_CATEGORY', 'PRODUCT_VIEW_SEARCH', 'PRODUCT_VIEW_BANNER'] },
      'metadata.productId': productId,
      userId: { $ne: null }
    });

    if (usersWhoViewed.length === 0) {
      // Fallback: Return similar products by category
      const currentProduct = await Product.findById(productId);
      if (currentProduct) {
        const similar = await Product.find({
          category: currentProduct.category,
          _id: { $ne: productId },
          isActive: true
        }).limit(limit);
        
        return NextResponse.json({ recommendations: similar });
      }
      return NextResponse.json({ recommendations: [] });
    }

    // Find other products these users also viewed
    const relatedProducts = await UserBehavior.aggregate([
      {
        $match: {
          userId: { $in: usersWhoViewed },
          event: { $in: ['PRODUCT_VIEW_HOME', 'PRODUCT_VIEW_CATEGORY', 'PRODUCT_VIEW_SEARCH', 'PRODUCT_VIEW_BANNER'] },
          'metadata.productId': { $exists: true, $ne: productId }
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
      { $limit: limit * 2 } // Get more to filter later
    ]);

    // Get full product details
    const productIds = relatedProducts.map(p => p._id).filter(id => id);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true
    }).limit(limit);

    return NextResponse.json({ 
      recommendations: products,
      algorithm: 'collaborative_filtering'
    });

  } catch (error: any) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
