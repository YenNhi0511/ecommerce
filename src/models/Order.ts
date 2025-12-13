import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  itemsTotal: number;      // tổng tiền hàng
  shippingFee: number;     // phí vận chuyển
  totalAmount: number;     // itemsTotal + shippingFee (sau này có thể trừ coupon nữa)
  shippingAddress?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    [key: string]: unknown;
  };
  paymentMethod: 'cod' | 'momo' | 'atm' | string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus:
    | 'pending'
    | 'processing'
    | 'failed'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'on-hold';
  trackingNumber?: string;
  stockReserved?: boolean;
  couponCode?: string | null;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    // ✅ tổng tiền sản phẩm
    itemsTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    // ✅ phí ship
    shippingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    // ✅ tổng thanh toán = itemsTotal + shippingFee (và sau này trừ mã giảm giá…)
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      name: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'momo', 'atm', 'other'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'failed', 'shipped', 'delivered', 'cancelled', 'on-hold'],
      default: 'pending',
    },
    trackingNumber: {
      type: String,
    },
    stockReserved: {
      type: Boolean,
      default: false,
    },
    couponCode: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
