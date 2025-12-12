'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAnalytics } from './AnalyticsContext';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  imageUrl?: string;
  quantity: number;
  brand: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const analytics = useAnalytics();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      const quantity = existing ? existing.quantity + 1 : 1;
      const basePrice = product.originalPrice && product.originalPrice > product.price ? product.originalPrice : product.price;
      
      // Track analytics
      if (analytics) {
        analytics.trackAddToCart(product._id, product.name, 1, basePrice);
      }
      
      if (existing) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity }
            : item
        );
      }
      return [...prev, {
        _id: product._id,
        name: product.name,
        price: basePrice,
        image: product.images?.[0] || '',
        quantity: 1,
        brand: product.brand
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find(i => i._id === productId);
    if (item && analytics) {
      analytics.trackEvent('CART_REMOVE', {
        productId,
        productName: item.name,
        quantity: item.quantity,
      });
    }
    setCart(prev => prev.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
