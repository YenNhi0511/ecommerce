"use client"
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function WishlistButton({ productId }: { productId: string }) {
  const { user, token } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user || !token) return; // Only load if user is authenticated
      try {
        const resp = await fetch('/api/wishlist', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Handle 401 gracefully - user not authenticated
        if (resp.status === 401) {
          if (mounted) setInWishlist(false);
          return;
        }
        
        if (!resp.ok) {
          console.warn('Failed to load wishlist:', resp.status);
          return;
        }
        
        const data = await resp.json();
        if (!mounted) return;
        const ids = (data.wishlist || []).map((p: any) => String(p._id || p));
        setInWishlist(ids.includes(String(productId)));
      } catch (e) {
        // Silently ignore errors - don't block UI
        if (mounted) setInWishlist(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user, productId, token]);

  const toggle = async () => {
    if (!user) {
      // optionally prompt login
      alert('Vui lòng đăng nhập để sử dụng Wishlist');
      return;
    }
    setLoading(true);
    try {
      if (inWishlist) {
        const url = `/api/wishlist?productId=${encodeURIComponent(productId)}`;
        const resp = await fetch(url, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
        const data = await resp.json();
        setInWishlist(false);
      } else {
        const resp = await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ productId }) });
        const data = await resp.json();
        setInWishlist(true);
      }
    } catch (e) {
      console.error('wishlist toggle', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={toggle} disabled={loading} className={`px-4 py-2 rounded border ${inWishlist ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-white text-black'}`}>
      {inWishlist ? '❤️ Yêu thích' : '♡ Thêm yêu thích'}
    </button>
  );
}
