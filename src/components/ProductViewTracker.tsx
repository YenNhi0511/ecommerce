'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';

interface ProductViewTrackerProps {
  productId: string;
  productName: string;
  category: string;
}

export default function ProductViewTracker({ productId, productName, category }: ProductViewTrackerProps) {
  const analytics = useAnalytics();

  useEffect(() => {
    // Validate props before tracking
    if (!productId || !productName) {
      console.warn('ProductViewTracker: Missing required props');
      return;
    }

    if (analytics) {
      try {
        // Track product view from detail page
        analytics.trackProductView(productId, productName, 'detail');
        
        // Also track with category metadata
        analytics.trackEvent('PRODUCT_VIEW_CATEGORY', {
          productId,
          productName,
          category: category || 'unknown',
          source: 'detail_page'
        });
      } catch (error) {
        // Silently fail - don't break UI
        console.error('Failed to track product view:', error);
      }
    }
  }, [productId, productName, category, analytics]);

  return null; // This component doesn't render anything
}
