// Utility functions for tracking user behavior

export interface BehaviorData {
  userId?: string;
  event: string;
  metadata?: Record<string, any>;
  sessionId?: string;
}

export async function trackBehavior(data: BehaviorData) {
  try {
    const response = await fetch('/api/behavior', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('Failed to track behavior:', response.statusText);
    }
  } catch (error) {
    console.error('Error tracking behavior:', error);
  }
}

// Specific tracking functions for each event type

// Search events
export const trackSearchInput = (query: string, sessionId?: string) =>
  trackBehavior({ event: 'SEARCH_INPUT', metadata: { query }, sessionId });

export const trackSearchResultsView = (query: string, resultCount: number, sessionId?: string) =>
  trackBehavior({ event: 'SEARCH_RESULTS_VIEW', metadata: { query, resultCount }, sessionId });

export const trackSearchProductClick = (productId: string, query: string, position: number, sessionId?: string) =>
  trackBehavior({ event: 'SEARCH_PRODUCT_CLICK', metadata: { productId, query, position }, sessionId });

export const trackSearchConversionAdd = (productId: string, query: string, sessionId?: string) =>
  trackBehavior({ event: 'SEARCH_CONVERSION_ADD', metadata: { productId, query }, sessionId });

export const trackSearchConversionExit = (query: string, sessionId?: string) =>
  trackBehavior({ event: 'SEARCH_CONVERSION_EXIT', metadata: { query }, sessionId });

// UI Engagement events
export const trackUiClickCategory = (category: string, userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'UI_CLICK_CATEGORY', metadata: { category }, userId, sessionId });

export const trackUiClickNav = (navItem: string, userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'UI_CLICK_NAV', metadata: { navItem }, userId, sessionId });

export const trackUiClickCartIcon = (userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'UI_CLICK_CART_ICON', userId, sessionId });

export const trackFilterApply = (filters: Record<string, any>, userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'FILTER_APPLY', metadata: { filters }, userId, sessionId });

export const trackSortChange = (sortBy: string, userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'SORT_CHANGE', metadata: { sortBy }, userId, sessionId });

export const trackScrollDepth = (depth: number, page: string, userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'SCROLL_DEPTH', metadata: { depth, page }, userId, sessionId });

// Product Behavior events
export const trackProductViewHome = (productId: string, position: number, userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'PRODUCT_VIEW_HOME', metadata: { productId, position }, userId, sessionId });

export const trackProductViewCategory = (productId: string, category: string, userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'PRODUCT_VIEW_CATEGORY', metadata: { productId, category }, userId, sessionId });

export const trackProductViewSearch = (productId: string, query: string, userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'PRODUCT_VIEW_SEARCH', metadata: { productId, query }, userId, sessionId });

export const trackProductViewBanner = (productId: string, bannerId: string, userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'PRODUCT_VIEW_BANNER', metadata: { productId, bannerId }, userId, sessionId });

export const trackCartAdd = (productId: string, quantity: number, userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'CART_ADD', metadata: { productId, quantity }, userId, sessionId });

export const trackCartUpdateQty = (productId: string, oldQuantity: number, newQuantity: number, userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'CART_UPDATE_QTY', metadata: { productId, oldQuantity, newQuantity }, userId, sessionId });

export const trackCartRemove = (productId: string, userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'CART_REMOVE', metadata: { productId }, userId, sessionId });

export const trackCartAbandon = (cartItems: any[], userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'CART_ABANDON', metadata: { cartItems }, userId, sessionId });

export const trackOrderComplete = (orderId: string, totalAmount: number, userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'ORDER_COMPLETE', metadata: { orderId, totalAmount }, userId, sessionId });

export const trackOrderCancel = (orderId: string, reason?: string, userId?: string, sessionId?: string) =>
  trackBehavior({ event: 'ORDER_CANCEL', metadata: { orderId, reason }, userId, sessionId });