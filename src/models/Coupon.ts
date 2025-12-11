import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['percent', 'amount'], default: 'percent' },
  value: { type: Number, required: true },
  active: { type: Boolean, default: true },
  expiresAt: { type: Date },
  minSubtotal: { type: Number },
  maxUses: { type: Number },
  usedCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
