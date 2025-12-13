import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getHotProducts } from '@/lib/products';

export default async function Home() {
  // Check APP_MODE to determine redirect behavior
  const appMode = process.env.APP_MODE || process.env.NEXT_PUBLIC_APP_MODE;
  
  // Port-based routing - redirect immediately
  if (appMode === 'admin') {
    redirect('/admin/dashboard');
  } else if (appMode === 'seller') {
    redirect('/seller/dashboard');
  }
  
  // Default: User/Customer interface (port 3000)
  const hotProducts = await getHotProducts();

  return (
    <div className="min-h-screen bg-[#0A1A2F] w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1A2F] to-[#1E3A5F] text-white w-full">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-[1400px] mx-auto px-[4%] py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            <div className="flex-1 space-y-6 sm:space-y-8 w-full lg:w-1/2">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-[#E0F7FF]">
                  Công nghệ
                  <span className="block bg-gradient-to-r from-[#00D4FF] to-[#00B8E6] bg-clip-text text-transparent">
                    tương lai
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#B0D0E8] leading-relaxed">
                  Khám phá thế giới công nghệ với những sản phẩm chất lượng cao
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/danh-muc/dien-thoai"
                  className="bg-[#00D4FF] text-[#0A1A2F] px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-[#00B8E6] transition-all duration-300 text-center"
                >
                  🛒 Mua sắm ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-[#0A1A2F] w-full">
        <div className="max-w-[1400px] mx-auto px-[4%]">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#E0F7FF] mb-6 sm:mb-8 text-center">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: 'Điện thoại', slug: 'dien-thoai', icon: '📱' },
              { name: 'Laptop', slug: 'laptop', icon: '💻' },
              { name: 'Máy tính bảng', slug: 'may-tinh-bang', icon: '📲' },
              { name: 'Phụ kiện', slug: 'phu-kien', icon: '🎧' },
            ].map((category) => (
              <Link
                key={category.slug}
                href={`/danh-muc/${category.slug}`}
                className="bg-[#0F2B52] border border-[#00D4FF]/30 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center hover:bg-[#00D4FF]/10 hover:border-[#00D4FF] transition-all duration-300 group aspect-square"
              >
                <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
                <span className="text-base sm:text-xl font-semibold text-[#E0F7FF] text-center">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Products */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#0F2B52] w-full">
        <div className="max-w-[1400px] mx-auto px-[4%]">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#E0F7FF] mb-8 sm:mb-12">Sản phẩm nổi bật</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {hotProducts.map((product: any) => (
              <Link
                key={product._id}
                href={`/san-pham/${product._id}`}
                className="group bg-[#0F2B52] rounded-2xl shadow-lg hover:shadow-2xl transition-all h-full flex flex-col"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-6xl">📱</div>
                  )}
                </div>
                <div className="p-4 sm:p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-base sm:text-lg text-[#E0F7FF] mb-2 line-clamp-2">{product.name}</h3>
                  <span className="text-xl sm:text-2xl font-bold text-[#FF6B6B] mt-auto">
                    {(product.originalPrice || product.price).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
