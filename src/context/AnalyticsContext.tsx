'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

type EventType = 
  | 'SEARCH_INPUT'
  | 'SEARCH_RESULTS_VIEW'
  | 'SEARCH_PRODUCT_CLICK'
  | 'SEARCH_CONVERSION_ADD'
  | 'SEARCH_CONVERSION_EXIT'
  | 'UI_CLICK_CATEGORY'
  | 'UI_CLICK_NAV'
  | 'UI_CLICK_CART_ICON'
  | 'FILTER_APPLY'
  | 'SORT_CHANGE'
  | 'SCROLL_DEPTH'
  | 'PRODUCT_VIEW_HOME'
  | 'PRODUCT_VIEW_CATEGORY'
  | 'PRODUCT_VIEW_SEARCH'
  | 'PRODUCT_VIEW_BANNER'
  | 'CART_ADD'
  | 'CART_UPDATE_QTY'
  | 'CART_REMOVE'
  | 'CART_ABANDON'
  | 'ORDER_COMPLETE'
  | 'ORDER_CANCEL';

type EventMetadata = {
  productId?: string;
  productName?: string;
  category?: string;
  searchQuery?: string;
  url?: string;
  referrer?: string;
  value?: number;
  quantity?: number;
  [key: string]: any;
};

interface AnalyticsContextType {
  trackEvent: (event: EventType, metadata?: EventMetadata) => void;
  trackProductView: (productId: string, productName: string, source: 'home' | 'category' | 'search' | 'banner') => void;
  trackAddToCart: (productId: string, productName: string, quantity: number, price: number) => void;
  trackSearch: (query: string, resultsCount: number) => void;
  trackCheckout: (orderId: string, totalAmount: number) => void;
  sessionId: string;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sessionId] = useState(() => {
    // Generate or retrieve session ID
    if (typeof window !== 'undefined') {
      let sid = sessionStorage.getItem('analytics_session_id');
      if (!sid) {
        sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('analytics_session_id', sid);
      }
      return sid;
    }
    return '';
  });

  const trackEvent = useCallback(async (event: EventType, metadata?: EventMetadata) => {
    // Skip tracking if no session ID (SSR or initialization)
    if (!sessionId || typeof window === 'undefined') {
      return;
    }

    try {
      // Get device info
      const deviceInfo = {
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        language: navigator.language,
      };

      const payload = {
        userId: user?._id || null,
        event,
        sessionId,
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          url: window.location.href,
          referrer: document.referrer,
        },
        deviceInfo,
      };

      // Send to API (non-blocking, silent fail)
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      .then(res => {
        if (!res.ok && res.status !== 200) {
          console.warn(`Analytics track failed: ${res.status}`);
        }
      })
      .catch(err => {
        // Silently fail - analytics should never break user experience
        console.warn('Analytics unavailable:', err.message);
      });

    } catch (error) {
      // Silently fail - don't show errors to user
      console.warn('Analytics tracking skipped:', error);
    }
  }, [user, sessionId]);

  const trackProductView = useCallback((
    productId: string, 
    productName: string, 
    source: 'home' | 'category' | 'search' | 'banner' | 'detail'
  ) => {
    const eventMap = {
      home: 'PRODUCT_VIEW_HOME',
      category: 'PRODUCT_VIEW_CATEGORY',
      search: 'PRODUCT_VIEW_SEARCH',
      banner: 'PRODUCT_VIEW_BANNER',
      detail: 'PRODUCT_VIEW_CATEGORY', // Map detail to category for now
    } as const;
    
    trackEvent(eventMap[source], { 
      productId, 
      productName,
      source 
    });
  }, [trackEvent]);

  const trackAddToCart = useCallback((
    productId: string,
    productName: string,
    quantity: number,
    price: number
  ) => {
    trackEvent('CART_ADD', {
      productId,
      productName,
      quantity,
      value: price * quantity,
    });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    trackEvent('SEARCH_RESULTS_VIEW', {
      searchQuery: query,
      resultsCount,
    });
  }, [trackEvent]);

  const trackCheckout = useCallback((orderId: string, totalAmount: number) => {
    trackEvent('ORDER_COMPLETE', {
      orderId,
      value: totalAmount,
    });
  }, [trackEvent]);

  // Track page views automatically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRouteChange = () => {
      trackEvent('UI_CLICK_NAV', {
        url: window.location.href,
      });
    };

    // Track initial page load
    trackEvent('UI_CLICK_NAV', {
      url: window.location.href,
    });

    // Listen to route changes (for Next.js App Router)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [trackEvent]);

  const value: AnalyticsContextType = {
    trackEvent,
    trackProductView,
    trackAddToCart,
    trackSearch,
    trackCheckout,
    sessionId,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
