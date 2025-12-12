import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Basic manual validation (không dùng Zod để tránh phụ thuộc thêm)
    const { items, shippingAddress, paymentMethod, couponCode } = body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    for (const it of items) {
      if (!it || typeof it.productId !== 'string' || !it.productId) {
        return NextResponse.json(
          { error: 'Invalid productId in items' },
          { status: 400 },
        );
      }
      if (typeof it.quantity !== 'number' || it.quantity < 1) {
        return NextResponse.json(
          { error: 'Invalid quantity in items' },
          { status: 400 },
        );
      }
    }

    // rate limit theo IP
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.headers.get('host') ||
      'anon';

    const { rateLimit } = await import('@/lib/rateLimit');
    const rl = rateLimit(`orders:${ip}`, 30, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const user = await getUserFromRequest(request);
    // Allow guest checkout - user is optional
    const userId = user?._id || null;

    await dbConnect();

    // 1. Tính tiền hàng (itemsTotal) + kiểm tra tồn kho
    let itemsTotal = 0;
    const orderItems: { product: unknown; quantity: number; price: number }[] =
      [];

    for (const it of items) {
      const prod = await Product.findById(it.productId);
      if (!prod) {
        return NextResponse.json(
          { error: `Product not found: ${it.productId}` },
          { status: 404 },
        );
      }
      if (prod.stock < it.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${prod.name}` },
          { status: 400 },
        );
      }

      // Use base/original price as product price (show base price and charge base price).
      const price = prod.originalPrice && prod.originalPrice > prod.price ? prod.originalPrice : prod.price;
      itemsTotal += price * it.quantity;

      orderItems.push({
        product: prod._id,
        quantity: it.quantity,
        price,
      });
    }

    // 2. Tổng thanh toán = tổng tiền hàng (không tính phí vận chuyển)
    const shippingFee = 0;
    const totalAmount = itemsTotal;

    // 3. Tạo đơn hàng
    const isCod = paymentMethod === 'cod';

    const order = await Order.create({
      user: userId,
      items: orderItems,
      itemsTotal,
      shippingFee,
      totalAmount,
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: 'pending',
      orderStatus: isCod ? 'pending' : 'pending',
      stockReserved: false,
      couponCode: couponCode || null,
    });

    // ⚙️ Cast _id sang string để dùng cho audit & response
    const orderIdStr = String(order._id);

    try {
      if (user) {
        await recordAudit(user, 'create_order', 'order', orderIdStr, {
          itemsTotal,
          shippingFee,
          totalAmount,
          paymentMethod,
          couponCode,
        });
      }
    } catch {
      // audit lỗi thì bỏ qua, không ảnh hưởng flow chính
    }

    return NextResponse.json(
      { message: 'Order created', orderId: orderIdStr, order },
      { status: 201 },
    );
  } catch (err) {
    console.error('Create order error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Lấy danh sách đơn hàng (trang /don-hang, /seller, /admin)
export async function GET(request: NextRequest) {
  try {
    // Admin / seller xem tất cả; customer xem đơn của mình
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    if (user.role === 'admin') {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate('user')
        .lean();
      return NextResponse.json({ orders });
    }

    if (user.role === 'seller') {
      const ProductModel = (await import('@/models/Product')).default;
      const sellerProducts = await ProductModel.find({
        createdBy: user._id,
      })
        .select('_id')
        .lean();

      const sellerProductIds = sellerProducts.map(p => String(p._id));
      const orders = await Order.find({
        'items.product': { $in: sellerProductIds },
      })
        .sort({ createdAt: -1 })
        .populate('user')
        .lean();

      return NextResponse.json({ orders });
    }

    // customer: chỉ đơn của chính mình
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('List orders error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Cập nhật đơn (seller / admin đổi trạng thái)
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, updates } = body || {};
    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await dbConnect();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Admin: sửa mọi đơn
    // Seller: chỉ sửa đơn có chứa sản phẩm của mình
    if (user.role === 'seller') {
      const ProductModel = (await import('@/models/Product')).default;
      const sellerProducts = await ProductModel.find({
        createdBy: user._id,
      })
        .select('_id')
        .lean();

      const sellerProductIds = sellerProducts.map(p => String(p._id));
      const intersects = order.items.some((it: { product: unknown }) =>
        sellerProductIds.includes(String(it.product)),
      );

      if (!intersects) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Chỉ cho phép update 1 số field
    if (typeof updates.orderStatus === 'string') {
      // If transitioning to processing and stock not yet reserved, reserve stock and increment sold
        order.orderStatus = updates.orderStatus;
      if (updates.orderStatus === 'processing' && !order.stockReserved) {
        const Product = (await import('@/models/Product')).default;
        let shortage = false;
        for (const it of order.items) {
          const prod = await Product.findById(it.product);
          if (!prod) {
            shortage = true;
            console.warn('Product not found when reserving stock on order update', it.product);
            continue;
          }
          if (prod.stock < 1) {
            shortage = true;
            console.warn(`Insufficient stock for ${prod._id} when reserving on order update`);
            continue;
          }
          await Product.findByIdAndUpdate(it.product, { $inc: { stock: -1, sold: 1 } });
        }
        if (!shortage) order.stockReserved = true;
        else order.orderStatus = 'on-hold';
      }
    }
    if (typeof updates.paymentStatus === 'string') {
      order.paymentStatus = updates.paymentStatus;
    }
    if (typeof updates.trackingNumber === 'string') {
      order.trackingNumber = updates.trackingNumber;
    }

    // If status becomes processing, reserve stock and increment sold if not already done
    if (typeof updates.orderStatus === 'string' && updates.orderStatus === 'processing' && !order.stockReserved) {
      const ProductModel = (await import('@/models/Product')).default;
      let shortage = false;
      for (const it of order.items) {
        const prod = await ProductModel.findById(it.product);
        if (!prod) { shortage = true; console.warn('Product not found when reserving (secondary)', it.product); continue; }
        if (prod.stock < 1) { shortage = true; console.warn(`Insufficient stock for ${prod._id} (secondary)`); continue; }
        await ProductModel.findByIdAndUpdate(it.product, { $inc: { stock: -1, sold: 1 } });
      }
      if (!shortage) order.stockReserved = true;
      else order.orderStatus = 'on-hold';
    }

    order.updatedAt = new Date();
    await order.save();

    // ⚙️ Cast _id sang string khi ghi audit
    const orderIdStr = String(order._id);

    try {
      await recordAudit(user, 'update_order', 'order', orderIdStr, { updates });
    } catch {
      // ignore
    }

    return NextResponse.json({ message: 'Order updated', order });
  } catch (err) {
    console.error('Update order error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
