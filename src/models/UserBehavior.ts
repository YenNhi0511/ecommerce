import mongoose from 'mongoose';

const UserBehaviorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  event: {
    type: String,
    enum: [
      // Search group
      'SEARCH_INPUT',
      'SEARCH_RESULTS_VIEW',
      'SEARCH_PRODUCT_CLICK',
      'SEARCH_CONVERSION_ADD',
      'SEARCH_CONVERSION_EXIT',
      // Engagement group
      'UI_CLICK_CATEGORY',
      'UI_CLICK_NAV',
      'UI_CLICK_CART_ICON',
      'FILTER_APPLY',
      'SORT_CHANGE',
      'SCROLL_DEPTH',
      // Product Behavior group
      'PRODUCT_VIEW_HOME',
      'PRODUCT_VIEW_CATEGORY',
      'PRODUCT_VIEW_SEARCH',
      'PRODUCT_VIEW_BANNER',
      'CART_ADD',
      'CART_UPDATE_QTY',
      'CART_REMOVE',
      'CART_ABANDON',
      'ORDER_COMPLETE',
      'ORDER_CANCEL'
    ],
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed }, // For additional data like productId, searchQuery, etc.
  sessionId: { type: String }, // Optional session tracking
  ipAddress: { type: String },
  userAgent: { type: String }
});

UserBehaviorSchema.index({ userId: 1, timestamp: -1 });
UserBehaviorSchema.index({ event: 1, timestamp: -1 });

export default mongoose.models.UserBehavior || mongoose.model('UserBehavior', UserBehaviorSchema);