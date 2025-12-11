import Link from 'next/link';
import Image from 'next/image';
import { getHotProducts } from '@/lib/products';

export default async function Home() {
  const hotProducts = await getHotProducts();

  return (
    <div className="min-h-screen bg-[#0A1A2F]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1A2F] to-[#1E3A5F] text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-[#E0F7FF]">
                  Công nghệ
                  <span className="block bg-gradient-to-r from-[#00D4FF] to-[#00B8E6] bg-clip-text text-transparent">
                    tương lai
                  </span>
                </h1>
                <p className="text-xl lg:text-2xl text-[#B0D0E8] leading-relaxed">
                  Khám phá thế giới công nghệ với những sản phẩm chất lượng cao,
                  giá cả phải chăng và dịch vụ khách hàng tuyệt vời.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/danh-muc/dien-thoai"
                  className="bg-[#00D4FF] text-[#0A1A2F] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#00B8E6] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-[#00D4FF]/50"
                >
                  🛒 Mua sắm ngay
                </Link>
                <Link
                  href="/khuyen-mai"
                  className="border-2 border-[#00D4FF] text-[#E0F7FF] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#00D4FF] hover:text-[#0A1A2F] transition-all duration-300 hover:scale-105"
                >
                  🎁 Khuyến mãi hot
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#E0F7FF]">10K+</div>
                  <div className="text-[#B0D0E8]">Sản phẩm</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#E0F7FF]">50K+</div>
                  <div className="text-[#B0D0E8]">Khách hàng</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#E0F7FF]">99%</div>
                  <div className="text-[#B0D0E8]">Hài lòng</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <div className="w-80 h-80 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center shadow-2xl">
                  <div className="text-8xl animate-bounce">🚀</div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute top-10 right-10 w-16 h-16 bg-[#00D4FF] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="absolute bottom-20 left-10 w-12 h-12 bg-[#FF6B6B] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-xl">💎</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-20">
            <path fill="#0F2B52" d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#0F2B52]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#E0F7FF] mb-4">
              Tại sao chọn <span className="text-[#00D4FF]">TechZone</span>?
            </h2>
            <p className="text-xl text-[#B0D0E8] max-w-2xl mx-auto">
              Chúng tôi mang đến trải nghiệm mua sắm công nghệ tốt nhất với dịch vụ chuyên nghiệp
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-[#0F2B52] border border-[#00D4FF] hover:shadow-xl hover:shadow-[#00D4FF]/30 transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00D4FF] to-[#00B8E6] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl text-[#0A1A2F]">🚚</span>
              </div>
              <h3 className="text-2xl font-bold text-[#E0F7FF] mb-4">Giao hàng siêu tốc</h3>
              <p className="text-[#B0D0E8]">Giao hàng trong 24h trên toàn quốc, miễn phí cho đơn hàng từ 500k</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-[#0F2B52] border border-[#00D4FF] hover:shadow-xl hover:shadow-[#00D4FF]/30 transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00D4FF] to-[#00B8E6] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl text-[#0A1A2F]">🛡️</span>
              </div>
              <h3 className="text-2xl font-bold text-[#E0F7FF] mb-4">Bảo hành chính hãng</h3>
              <p className="text-[#B0D0E8]">Bảo hành chính hãng lên đến 24 tháng, hỗ trợ kỹ thuật 24/7</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-[#0F2B52] border border-[#00D4FF] hover:shadow-xl hover:shadow-[#00D4FF]/30 transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00D4FF] to-[#00B8E6] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl text-[#0A1A2F]">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-[#E0F7FF] mb-4">Giá tốt nhất</h3>
              <p className="text-[#B0D0E8]">Cam kết giá tốt nhất thị trường, hoàn tiền nếu tìm được giá rẻ hơn</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-[#0F2B52]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#E0F7FF] mb-4">Danh mục sản phẩm</h2>
            <p className="text-xl text-[#B0D0E8]">Khám phá các danh mục sản phẩm công nghệ hot nhất</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Link href="/danh-muc/dien-thoai" className="group">
              <div className="bg-[#0F2B52] rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:shadow-[#00D4FF]/30 transition-all duration-300 hover:scale-105 text-center border border-[#00D4FF]">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00D4FF] to-[#00B8E6] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-4xl text-[#0A1A2F]">📱</span>
                </div>
                <h3 className="text-xl font-bold text-[#E0F7FF] mb-2">Điện thoại</h3>
                <p className="text-[#B0D0E8]">iPhone, Samsung, Xiaomi</p>
                <div className="mt-4 text-[#00D4FF] font-semibold group-hover:text-[#00B8E6]">
                  Khám phá →
                </div>
              </div>
            </Link>

            <Link href="/danh-muc/laptop" className="group">
              <div className="bg-[#0F2B52] rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:shadow-[#00D4FF]/30 transition-all duration-300 hover:scale-105 text-center border border-[#00D4FF]">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00D4FF] to-[#00B8E6] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-4xl text-[#0A1A2F]">💻</span>
                </div>
                <h3 className="text-xl font-bold text-[#E0F7FF] mb-2">Laptop</h3>
                <p className="text-[#B0D0E8]">Gaming, Văn phòng, Ultrabook</p>
                <div className="mt-4 text-[#00D4FF] font-semibold group-hover:text-[#00B8E6]">
                  Khám phá →
                </div>
              </div>
            </Link>

            <Link href="/danh-muc/may-tinh-bang" className="group">
              <div className="bg-[#0F2B52] rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:shadow-[#00D4FF]/30 transition-all duration-300 hover:scale-105 text-center border border-[#00D4FF]">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00D4FF] to-[#00B8E6] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-4xl text-[#0A1A2F]">📲</span>
                </div>
                <h3 className="text-xl font-bold text-[#E0F7FF] mb-2">Máy tính bảng</h3>
                <p className="text-[#B0D0E8]">iPad, Samsung Tab, Surface</p>
                <div className="mt-4 text-[#00D4FF] font-semibold group-hover:text-[#00B8E6]">
                  Khám phá →
                </div>
              </div>
            </Link>

            <Link href="/danh-muc/phu-kien" className="group">
              <div className="bg-[#0F2B52] rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:shadow-[#00D4FF]/30 transition-all duration-300 hover:scale-105 text-center border border-[#00D4FF]">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00D4FF] to-[#00B8E6] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-4xl text-[#0A1A2F]">🎧</span>
                </div>
                <h3 className="text-xl font-bold text-[#E0F7FF] mb-2">Phụ kiện</h3>
                <p className="text-[#B0D0E8]">Tai nghe, Sạc, Ốp lưng</p>
                <div className="mt-4 text-[#00D4FF] font-semibold group-hover:text-[#00B8E6]">
                  Khám phá →
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Hot Products Section */}
      <section className="py-20 bg-[#0F2B52]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-[#E0F7FF] mb-2">Sản phẩm nổi bật</h2>
              <p className="text-xl text-[#B0D0E8]">Những sản phẩm được yêu thích nhất</p>
            </div>
            <Link
              href="/danh-muc/dien-thoai"
              className="bg-[#00D4FF] text-[#0A1A2F] px-6 py-3 rounded-full font-bold hover:bg-[#00B8E6] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#00D4FF]/50"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {hotProducts.map((product: any) => (
              <Link
                key={product._id}
                href={`/san-pham/${product._id}`}
                className="group bg-[#0F2B52] rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-[#00D4FF]/30 transition-all duration-300 hover:scale-105 overflow-hidden border border-[#00D4FF]"
              >
                <div className="relative overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-6xl">📱</div>
                    )}
                  </div>

                  {/* discounts hidden on listing; show base price only */}

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg text-[#E0F7FF] mb-2 line-clamp-2 group-hover:text-[#00D4FF] transition-colors duration-200">
                    {product.name}
                  </h3>

                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(product.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-[#B0D0E8] ml-2">({product.reviews || 0})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {(() => {
                        const displayPrice = product.originalPrice && product.originalPrice > product.price ? product.originalPrice : product.price;
                        return (
                          <span className="text-2xl font-bold text-[#FF6B6B]">{displayPrice.toLocaleString('vi-VN')}₫</span>
                        );
                      })()}
                    </div>

                    <button className="bg-gradient-to-r from-[#00D4FF] to-[#00B8E6] text-[#0A1A2F] p-3 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-110">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0A1A2F] to-[#1E3A5F] text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-[#E0F7FF]">
              Sẵn sàng trải nghiệm mua sắm công nghệ?
            </h2>
            <p className="text-xl text-[#B0D0E8] mb-8">
              Đăng ký ngay để nhận ưu đãi đặc biệt và cập nhật những sản phẩm mới nhất
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dang-ky"
                className="bg-[#00D4FF] text-[#0A1A2F] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#00B8E6] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#00D4FF]/50"
              >
                🔔 Đăng ký ngay
              </Link>
              <Link
                href="/lien-he"
                className="border-2 border-[#00D4FF] text-[#E0F7FF] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#00D4FF] hover:text-[#0A1A2F] transition-all duration-300 hover:scale-105"
              >
                📞 Liên hệ chúng tôi
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
