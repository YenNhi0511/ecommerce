import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    // Only sellers or admins may update product
    const user: any = await getUserFromRequest(request as any);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['seller', 'admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const allowedFields = ['name','description','price','originalPrice','category','brand','images','stock','features','specifications','isActive'];
    const update: any = { updatedAt: new Date() };
    // Basic manual validation
    if (body.price !== undefined && typeof body.price !== 'number') return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    if (body.originalPrice !== undefined && typeof body.originalPrice !== 'number') return NextResponse.json({ error: 'Invalid originalPrice' }, { status: 400 });
    if (body.stock !== undefined && typeof body.stock !== 'number') return NextResponse.json({ error: 'Invalid stock' }, { status: 400 });
    for (const key of allowedFields) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    // Basic validation
    if (update.price !== undefined && (typeof update.price !== 'number' || update.price < 0)) {
      return NextResponse.json({ error: 'Giá sản phẩm phải là số dương' }, { status: 400 });
    }
    if (update.originalPrice !== undefined && (typeof update.originalPrice !== 'number' || update.originalPrice < 0)) {
      return NextResponse.json({ error: 'Giá gốc phải là số dương' }, { status: 400 });
    }

    // Ensure sellers can only modify their own products (admins can modify any)
    const prod = await Product.findById(params.id);
    if (!prod) return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
    if (user.role === 'seller' && String(prod.createdBy) !== String(user._id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(params.id, update, { new: true });

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

    // audit
    try { await (await import('@/lib/audit')).recordAudit(user, 'update_product', 'product', params.id, { update }); } catch (e) { }

  } catch (error) {
    console.error('Error updating product price:', error);
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const user: any = await getUserFromRequest(request as any);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['seller', 'admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const prod = await Product.findById(params.id);
    if (!prod) return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
    if (user.role === 'seller' && String(prod.createdBy) !== String(user._id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Product.findByIdAndDelete(params.id);
    // audit delete
    try { await (await import('@/lib/audit')).recordAudit(user, 'delete_product', 'product', params.id, {}); } catch (e) { }
    return NextResponse.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
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