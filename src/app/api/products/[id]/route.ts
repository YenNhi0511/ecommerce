import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const body = await request.json();
    const { price, originalPrice } = body;

    // Validate input
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json(
        { error: 'Giá sản phẩm phải là số dương' },
        { status: 400 }
      );
    }

    if (originalPrice !== undefined && (typeof originalPrice !== 'number' || originalPrice < 0)) {
      return NextResponse.json(
        { error: 'Giá gốc phải là số dương' },
        { status: 400 }
      );
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      {
        price,
        originalPrice,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Cập nhật giá thành công',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Error updating product price:', error);
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}