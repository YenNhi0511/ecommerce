import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import WebhookEvent from '@/models/WebhookEvent';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';

interface MomoNotifyBody {
  orderId: string;
  resultCode: number;
  message?: string;
  amount?: number;
  extraData?: string;
  transId?: number;
  partnerCode?: string;
  requestId?: string;
  signature?: string;
  [key: string]: unknown;
}

interface OrderDoc {
  _id: string;
  paymentStatus?: string;
  orderStatus?: string;
  paymentMethod?: string;
  paidAt?: Date;
  items?: { product: string | { toString(): string }; quantity: number; price: number }[];
  stockReserved?: boolean;
  couponCode?: string | null;
}

interface OrderDocWithSave extends OrderDoc {
  save: () => Promise<void>;
}

/**
 * IPN từ MoMo gọi về khi thanh toán xong.
 * URL: POST /api/payments/momo/notify
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = (await request
      .json()
      .catch(() => null)) as MomoNotifyBody | null;

    if (!body || !body.orderId) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 },
      );
    }

    // Lưu log IPN cho admin debug
    try {
      await WebhookEvent.create({
        provider: 'momo',
        eventId: String(body.requestId || body.orderId),
        type: 'momo.ipn',
        raw: JSON.stringify(body),
        metadata: { orderId: body.orderId },
      });
    } catch (e) {
      console.warn('Failed to persist momo ipn event', e);
    }

    console.log('MoMo IPN received for orderId=', body.orderId, 'resultCode=', body.resultCode);

    const order = (await Order.findById(
      body.orderId,
    )) as OrderDocWithSave | null;

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 },
      );
    }

    // ✅ Thanh toán thành công
    if (body.resultCode === 0) {
      order.paymentStatus = 'paid';
      order.paymentMethod = 'momo';
      order.paidAt = new Date();

      // QUY TẮC:
      // - Nếu trước đó orderStatus đang pending (đặt hàng, chưa xử lý)
      //   thì sau khi thanh toán thành công -> chuyển sang processing.
      if (!order.orderStatus || order.orderStatus === 'pending') {
        order.orderStatus = 'processing';
      }
      // Nếu chưa reserve stock thì reserve (decrement stock by 1, increment sold by 1)
      if (!order.stockReserved) {
        let shortage = false;
        for (const it of order.items || []) {
          const prod = await Product.findById(String(it.product));
          if (!prod) {
            shortage = true;
            console.warn('Product not found when reserving stock in MoMo notify', it.product);
            continue;
          }
          console.log('MoMo notify - product', String(prod._id), 'currentStock=', prod.stock);
          if (prod.stock < 1) {
            shortage = true;
            console.warn(`Insufficient stock for ${prod._id} in MoMo notify`);
            continue;
          }
          const updated = await Product.findByIdAndUpdate(prod._id, { $inc: { stock: -1, sold: 1 } }, { new: true });
          console.log('MoMo notify - product after update', String(prod._id), 'newStock=', updated?.stock);
        }
        if (!shortage) {
          order.stockReserved = true;
        } else {
          order.orderStatus = 'on-hold';
        }
        console.log('MoMo notify - reservation complete for order', String(order._id), 'stockReserved=', !!order.stockReserved);
      }
    } else {
      // ❌ Thanh toán thất bại hoặc bị hủy
      order.paymentStatus = 'failed';
      if (!order.orderStatus || order.orderStatus === 'pending') {
        order.orderStatus = 'cancelled';
      }
    }

    await order.save();

    // Nếu có mã coupon, tăng usedCount (tương tự Stripe flow)
    try {
      if (order.couponCode) {
        const c = await Coupon.findOne({ code: order.couponCode });
        if (c) {
          c.usedCount = (c.usedCount || 0) + 1;
          await c.save();
        }
      }
    } catch (e) {
      console.warn('Failed to increment coupon usedCount in MoMo notify', e);
    }

    // MoMo yêu cầu response dạng { resultCode, message }
    return NextResponse.json({
      resultCode: 0,
      message: 'IPN received',
    });
  } catch (err) {
    console.error('MoMo notify error:', err);
    return NextResponse.json(
      { resultCode: 1, message: 'Server error' },
      { status: 500 },
    );
  }
}
