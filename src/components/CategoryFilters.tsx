'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

interface CategoryFiltersProps {
    availableBrands: string[];
    currentFilters: {
        minPrice?: number;
        maxPrice?: number;
        brands: string[];
        sort: string;
    };
}

export default function CategoryFilters({ availableBrands, currentFilters }: CategoryFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [minPrice, setMinPrice] = useState(currentFilters.minPrice || 0);

    const categories = [
        { name: 'Điện thoại', slug: 'dien-thoai', icon: '📱' },
        { name: 'Laptop', slug: 'laptop', icon: '💻' },
        { name: 'Máy tính bảng', slug: 'may-tinh-bang', icon: '📲' },
        { name: 'Phụ kiện', slug: 'phu-kien', icon: '🎧' },
    ];
    const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || 50000000);
    const [selectedBrands, setSelectedBrands] = useState<string[]>(currentFilters.brands);
    const [sort, setSort] = useState(currentFilters.sort);

    const applyFilters = () => {
        const params = new URLSearchParams();
        
        if (minPrice > 0) params.set('minPrice', minPrice.toString());
        if (maxPrice < 50000000) params.set('maxPrice', maxPrice.toString());
        if (selectedBrands.length > 0) {
            selectedBrands.forEach(brand => params.append('brands', brand));
        }
        if (sort && sort !== 'newest') params.set('sort', sort);
        
        params.set('page', '1');
        
        router.push(`?${params.toString()}`);
    };

    const clearFilters = () => {
        setMinPrice(0);
        setMaxPrice(50000000);
        setSelectedBrands([]);
        setSort('newest');
        router.push(window.location.pathname);
    };

    const toggleBrand = (brand: string) => {
        setSelectedBrands(prev => 
            prev.includes(brand) 
                ? prev.filter(b => b !== brand)
                : [...prev, brand]
        );
    };

    const handleSortChange = (newSort: string) => {
        setSort(newSort);
        const params = new URLSearchParams(searchParams.toString());
        if (newSort !== 'newest') {
            params.set('sort', newSort);
        } else {
            params.delete('sort');
        }
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    return (
        <div className="bg-[#0F2B52] rounded-lg shadow-md border border-[#00D4FF] p-4 h-fit sticky top-4">
            {/* Categories */}
            <div className="mb-6 pb-6 border-b border-[#00D4FF]/30">
                <h3 className="font-semibold mb-4 text-[#E0F7FF]">Danh mục</h3>
                <div className="space-y-2">
                    {categories.map((cat) => {
                        const isActive = pathname === `/danh-muc/${cat.slug}`;
                        return (
                            <Link
                                key={cat.slug}
                                href={`/danh-muc/${cat.slug}`}
                                className={`flex items-center space-x-3 p-2 rounded transition-colors ${
                                    isActive 
                                        ? 'bg-[#00D4FF]/20 text-[#00D4FF]' 
                                        : 'text-[#B0D0E8] hover:bg-[#00D4FF]/10 hover:text-[#E0F7FF]'
                                }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Price filter */}
            <div className="mb-6 pb-6 border-b border-[#00D4FF]/30">
                <h3 className="font-semibold mb-4 text-[#E0F7FF]">Khoảng giá</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-[#B0D0E8] mb-2 block">Từ (₫)</label>
                        <input
                            type="range"
                            min="0"
                            max="50000000"
                            step="100000"
                            value={minPrice}
                            onChange={(e) => setMinPrice(Number(e.target.value))}
                            className="w-full h-2 bg-[#0A1A2F] rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
                        />
                        <div className="text-sm text-[#E0F7FF] mt-1">{formatPrice(minPrice)} ₫</div>
                    </div>
                    <div>
                        <label className="text-xs text-[#B0D0E8] mb-2 block">Đến (₫)</label>
                        <input
                            type="range"
                            min="0"
                            max="50000000"
                            step="100000"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className="w-full h-2 bg-[#0A1A2F] rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
                        />
                        <div className="text-sm text-[#E0F7FF] mt-1">{formatPrice(maxPrice)} ₫</div>
                    </div>
                </div>
            </div>

            {/* Brand filter */}
            <div className="mb-6 pb-6 border-b border-[#00D4FF]/30">
                <h3 className="font-semibold mb-4 text-[#E0F7FF]">Thương hiệu</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableBrands.map(brand => (
                        <label key={brand} className="flex items-center space-x-2 cursor-pointer hover:bg-[#00D4FF]/10 p-2 rounded">
                            <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand)}
                                onChange={() => toggleBrand(brand)}
                                className="rounded text-[#00D4FF] focus:ring-[#00D4FF] bg-[#0A1A2F] border-[#00D4FF]/50"
                            />
                            <span className="text-sm text-[#B0D0E8]">{brand}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Sort */}
            <div className="mb-6">
                <h3 className="font-semibold mb-4 text-[#E0F7FF]">Sắp xếp</h3>
                <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A1A2F] border border-[#00D4FF]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-[#E0F7FF]"
                >
                    <option value="newest">Mới nhất</option>
                    <option value="price-asc">Giá thấp → cao</option>
                    <option value="price-desc">Giá cao → thấp</option>
                    <option value="rating">Đánh giá cao</option>
                </select>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
                <button
                    onClick={applyFilters}
                    className="w-full bg-gradient-to-r from-[#00D4FF] to-[#00B8E6] text-[#0A1A2F] px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#00D4FF]/50 transition-all"
                >
                    Áp dụng
                </button>
                <button
                    onClick={clearFilters}
                    className="w-full bg-[#0A1A2F] border border-[#00D4FF]/50 text-[#E0F7FF] px-4 py-2 rounded-lg font-semibold hover:bg-[#00D4FF]/20 transition-all"
                >
                    Xóa bộ lọc
                </button>
            </div>
        </div>
    );
}
