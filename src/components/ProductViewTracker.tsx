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
    if (analytics) {
      // Track product view from detail page
      analytics.trackProductView(productId, productName, 'detail');
      
      // Also track with category metadata
      analytics.trackEvent('PRODUCT_VIEW_DETAIL', {
        productId,
        productName,
        category,
        source: 'detail_page'
      });
    }
  }, [productId, productName, category, analytics]);

  return null; // This component doesn't render anything
}
