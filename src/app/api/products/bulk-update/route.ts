import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { updates, category, brand, priceMultiplier } = body;

    let query: any = {};

    // Filter by category or brand if specified
    if (category) query.category = category;
    if (brand) query.brand = brand;

    // If specific updates provided
    if (updates && Array.isArray(updates)) {
      const bulkOps = updates.map((update: any) => ({
        updateOne: {
          filter: { _id: update.id },
          update: {
            price: update.price,
            originalPrice: update.originalPrice,
            updatedAt: new Date()
          }
        }
      }));

      const result = await Product.bulkWrite(bulkOps);
      return NextResponse.json({
        message: `Cập nhật ${result.modifiedCount} sản phẩm thành công`,
        result
      });
    }

    // If price multiplier for category/brand
    if (priceMultiplier && typeof priceMultiplier === 'number') {
      const result = await Product.updateMany(
        query,
        [
          {
            $set: {
              price: { $multiply: ['$price', priceMultiplier] },
              originalPrice: {
                $cond: {
                  if: { $ne: ['$originalPrice', null] },
                  then: { $multiply: ['$originalPrice', priceMultiplier] },
                  else: '$originalPrice'
                }
              },
              updatedAt: new Date()
            }
          }
        ]
      );

      return NextResponse.json({
        message: `Cập nhật giá ${result.modifiedCount} sản phẩm với hệ số ${priceMultiplier}`,
        result
      });
    }

    return NextResponse.json(
      { error: 'Thiếu thông tin cập nhật' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error bulk updating products:', error);
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}