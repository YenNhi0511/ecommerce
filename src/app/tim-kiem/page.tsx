'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAnalytics } from '@/context/AnalyticsContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  sold?: number;
  category: string;
  brand: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const analytics = useAnalytics();

  useEffect(() => {
    if (query.trim()) {
      searchProducts(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const searchProducts = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      const products = data.products || [];
      setResults(products);
      
      // Track search event
      if (analytics) {
        analytics.trackSearch(searchQuery, products.length);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-[4%] py-8">
        {/* Search header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Kết quả tìm kiếm cho: <span className="text-blue-600">"{query}"</span>
          </h1>
          <p className="text-gray-600">
            {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${results.length} sản phẩm`}
          </p>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-600 mb-6">Thử tìm kiếm với từ khóa khác</p>
            <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition">
              Về trang chủ
            </Link>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((product) => (
              <Link 
                key={product._id} 
                href={`/san-pham/${product._id}`} 
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-500 transition-all group"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.images && product.images[0] ? (
                    <Image 
                      src={product.images[0]} 
                      alt={product.name} 
                      width={200} 
                      height={200} 
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="text-5xl">📱</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-2 line-clamp-2 h-10 group-hover:text-blue-600 transition">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline space-x-2 mb-1">
                    {(() => {
                      const displayPrice = product.originalPrice && product.originalPrice > product.price ? product.originalPrice : product.price;
                      return (
                        <p className="text-red-600 font-bold text-lg">{displayPrice.toLocaleString()}₫</p>
                      );
                    })()}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="ml-1 text-gray-600">{product.rating || 5}</span>
                    </div>
                    <span className="text-gray-400">Đã bán {product.sold || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}