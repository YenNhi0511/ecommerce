import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function getProducts(limit = 20, category?: string) {
  await dbConnect();
  const query = category ? { isActive: true, category } : { isActive: true };
  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return products;
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