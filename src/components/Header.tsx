'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';

export default function Header() {
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const cartCount = getTotalItems();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: 'Điện thoại', slug: 'dien-thoai', icon: '📱' },
    { name: 'Laptop', slug: 'laptop', icon: '💻' },
    { name: 'Máy tính bảng', slug: 'may-tinh-bang', icon: '📲' },
    { name: 'Phụ kiện', slug: 'phu-kien', icon: '🎧' },
  ];

  return (
    <header className="bg-[#0F2B52]/95 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-[#00D4FF] w-full">
      {/* Top announcement bar */}
      <div className="bg-gradient-to-r from-[#0A1A2F] to-[#1E3A5F] text-[#E0F7FF] w-full" suppressHydrationWarning>
        <div className="max-w-[1400px] mx-auto px-[2%] sm:px-[4%] py-2">
          <div className="flex items-center justify-center text-xs sm:text-sm font-medium">
            <span className="animate-pulse">🚀</span>
            <span className="mx-2">{t('top.announcement', 'Miễn phí giao hàng toàn quốc cho đơn hàng từ 500k')}</span>
            <span className="animate-pulse">🚀</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-[1400px] mx-auto px-[2%] sm:px-[4%] py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#00D4FF] to-[#00B8E6] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-xl sm:text-2xl">🛒</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00B8E6] bg-clip-text text-transparent">
                TechZone
              </div>
              <div className="text-xs text-[#B0D0E8] -mt-1">{t('site.tagline', 'Future of Shopping')}</div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-8 flex-1 justify-center">
            {user?.role === 'admin' ? (
              <>
                <Link href="/admin" className="text-[#E0F7FF] hover:text-[#00D4FF] font-medium transition-colors duration-200 relative group">
                  🎛️ Bảng điều khiển
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D4FF] group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link href="/admin/users" className="text-[#E0F7FF] hover:text-[#00D4FF] font-medium transition-colors duration-200 relative group">
                  👥 Người dùng
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D4FF] group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link href="/admin/products" className="text-[#E0F7FF] hover:text-[#00D4FF] font-medium transition-colors duration-200 relative group">
                  📦 Sản phẩm
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D4FF] group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link href="/admin/orders" className="text-[#E0F7FF] hover:text-[#00D4FF] font-medium transition-colors duration-200 relative group">
                  🛍️ Đơn hàng
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D4FF] group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link href="/admin/analytics" className="text-[#E0F7FF] hover:text-[#00D4FF] font-medium transition-colors duration-200 relative group">
                  📊 Analytics
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D4FF] group-hover:w-full transition-all duration-300"></span>
                </Link>
              </>
            ) : user?.role === 'seller' ? (
              <>
                <Link href="/seller/products" className="text-[#E0F7FF] hover:text-[#00D4FF] font-medium transition-colors duration-200 relative group">
                  📊 Bảng điều khiển
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D4FF] group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link href="/seller/products" className="text-[#E0F7FF] hover:text-[#00D4FF] font-medium transition-colors duration-200 relative group">
                  📦 Quản lý sản phẩm
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D4FF] group-hover:w-full transition-all duration-300"></span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/" className="text-[#E0F7FF] hover:text-[#00D4FF] font-medium transition-colors duration-200 relative group">
                  {t('nav.home', 'Trang chủ')}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D4FF] group-hover:w-full transition-all duration-300"></span>
                </Link>
                <div className="relative group">
                  <button
                    onClick={() => setShowCategories(!showCategories)}
                    onMouseEnter={() => setShowCategories(true)}
                    onMouseLeave={() => setShowCategories(false)}
                    className="text-[#E0F7FF] hover:text-[#00D4FF] font-medium transition-colors duration-200 flex items-center space-x-1"
                  >
                    <span>{t('nav.products', 'Sản phẩm')}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showCategories && (
                    <div
                      className="absolute top-full left-0 mt-2 w-64 bg-[#0F2B52] rounded-xl shadow-2xl border border-[#00D4FF] py-3 z-50 pointer-events-auto"
                      onMouseEnter={() => setShowCategories(true)}
                      onMouseLeave={() => setShowCategories(false)}
                    >
                      {categories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/danh-muc/${category.slug}`}
                          onClick={() => setShowCategories(false)}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-[#00D4FF]/20 transition-colors duration-200 cursor-pointer"
                        >
                          <span className="text-xl">{category.icon}</span>
                          <span className="text-[#E0F7FF] font-medium">{category.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <Link href="/khuyen-mai" className="text-[#E0F7FF] hover:text-[#00D4FF] font-medium transition-colors duration-200 relative group">
                  {t('nav.promotions', 'Khuyến mãi')}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D4FF] group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link href="/lien-he" className="text-[#E0F7FF] hover:text-[#00D4FF] font-medium transition-colors duration-200 relative group">
                  {t('nav.contact', 'Liên hệ')}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D4FF] group-hover:w-full transition-all duration-300"></span>
                </Link>
              </>
            )}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search.placeholder', 'Tìm kiếm sản phẩm...')}
                  className="w-80 px-4 py-2 pl-10 border border-[#00D4FF] rounded-full focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent transition-all duration-200 bg-[#0F2B52] text-[#E0F7FF] placeholder-[#B0D0E8]"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-[#B0D0E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Cart - Hidden for seller and admin */}
            {user?.role !== 'seller' && user?.role !== 'admin' && (
              <Link
                href="/gio-hang"
                className="relative p-2 hover:bg-[#00D4FF]/20 rounded-full transition-colors duration-200 group"
              >
                <svg className="w-6 h-6 text-[#E0F7FF] group-hover:text-[#00D4FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FF6B6B] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Account */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 hover:bg-[#00D4FF]/20 rounded-full transition-colors duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#00D4FF] to-[#00B8E6] rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <svg className="w-4 h-4 text-[#B0D0E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#0F2B52] rounded-xl shadow-2xl border border-[#00D4FF] py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link href="/tai-khoan" className="block px-4 py-2 text-[#E0F7FF] hover:bg-[#00D4FF]/20 hover:text-[#00D4FF] transition-colors duration-200">
                    {t('account.myAccount', 'Tài khoản của tôi')}
                  </Link>
                  <Link href="/don-hang" className="block px-4 py-2 text-[#E0F7FF] hover:bg-[#00D4FF]/20 hover:text-[#00D4FF] transition-colors duration-200">
                    {t('account.orders', 'Đơn hàng')}
                  </Link>
                  {user?.role === 'admin' && (
                    <>
                      <div className="border-t border-[#00D4FF]/30 my-2"></div>
                      <Link href="/admin" className="block px-4 py-2 text-[#E0F7FF] hover:bg-[#00D4FF]/20 hover:text-[#00D4FF] transition-colors duration-200">
                        🎛️ Bảng điều khiển
                      </Link>
                      <Link href="/admin/users" className="block px-4 py-2 text-[#E0F7FF] hover:bg-[#00D4FF]/20 hover:text-[#00D4FF] transition-colors duration-200">
                        👥 Quản lý người dùng
                      </Link>
                      <Link href="/admin/products" className="block px-4 py-2 text-[#E0F7FF] hover:bg-[#00D4FF]/20 hover:text-[#00D4FF] transition-colors duration-200">
                        📦 Quản lý sản phẩm
                      </Link>
                      <Link href="/admin/orders" className="block px-4 py-2 text-[#E0F7FF] hover:bg-[#00D4FF]/20 hover:text-[#00D4FF] transition-colors duration-200">
                        🛍️ Quản lý đơn hàng
                      </Link>
                      <Link href="/admin/analytics" className="block px-4 py-2 text-[#E0F7FF] hover:bg-[#00D4FF]/20 hover:text-[#00D4FF] transition-colors duration-200">
                        📊 Analytics
                      </Link>
                    </>
                  )}
                  {user?.role === 'seller' && (
                    <>
                      <div className="border-t border-[#00D4FF]/30 my-2"></div>
                      <Link href="/seller/products" className="block px-4 py-2 text-[#E0F7FF] hover:bg-[#00D4FF]/20 hover:text-[#00D4FF] transition-colors duration-200">
                        📊 Bảng điều khiển
                      </Link>
                      <Link href="/seller/products" className="block px-4 py-2 text-[#E0F7FF] hover:bg-[#00D4FF]/20 hover:text-[#00D4FF] transition-colors duration-200">
                        📦 Quản lý sản phẩm
                      </Link>
                    </>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-[#E0F7FF] hover:bg-[#FF6B6B]/20 hover:text-[#FF6B6B] transition-colors duration-200"
                  >
                    {t('auth.logout', 'Đăng xuất')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dang-nhap"
                  className="text-[#E0F7FF] hover:text-[#00D4FF] font-medium transition-colors duration-200"
                >
                  {t('auth.login', 'Đăng nhập')}
                </Link>
                <Link
                  href="/dang-ky"
                  className="bg-gradient-to-r from-[#00D4FF] to-[#00B8E6] text-white px-4 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  {t('auth.register', 'Đăng ký')}
                </Link>
              </div>
            )}

            {/* Language toggle */}
            <div className="ml-2">
              <select value={locale} onChange={(e) => setLocale(e.target.value as any)} className="bg-[#0F2B52] text-[#E0F7FF] border border-[#00D4FF] rounded px-2 py-1">
                <option value="vn">VN</option>
                <option value="en">EN</option>
              </select>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 hover:bg-[#00D4FF]/20 rounded-full transition-colors duration-200">
              <svg className="w-6 h-6 text-[#E0F7FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden mt-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-4 py-3 pl-10 border border-[#00D4FF] rounded-full focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent transition-all duration-200 bg-[#0F2B52] text-[#E0F7FF] placeholder-[#B0D0E8]"
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-[#B0D0E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}