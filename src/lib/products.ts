import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function getProducts(limit = 20, category?: string) {
  await dbConnect();
  const query = category ? { isActive: true, category } : { isActive: true };
  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  // enrich products with discount percent and review count for UI
  return products.map((p: any) => ({
    ...p,
    discount: p.originalPrice && p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0,
    reviews: Array.isArray(p.reviews) ? p.reviews.length : (typeof p.reviews === 'number' ? p.reviews : 0),
    rating: typeof p.rating === 'number' ? p.rating : 0,
    stock: typeof p.stock === 'number' ? p.stock : 0,
    sold: typeof p.sold === 'number' ? p.sold : 0,
  }));
}

export async function getHotProducts() {
  return getProducts(8);
}

export async function getFlashSaleProducts() {
  await dbConnect();
  const products = await Product.find({ isActive: true, originalPrice: { $exists: true } })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();
  return products;
}