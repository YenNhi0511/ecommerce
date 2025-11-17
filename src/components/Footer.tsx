import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#0A1A2F] via-[#0F2B52] to-[#0A1A2F] text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#00D4FF] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#00B8E6] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#FF6B6B] rounded-full blur-3xl"></div>
      </div>

      <div className="relative">
        {/* Newsletter Section */}
        <div className="border-b border-[#00D4FF]/20">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl font-bold mb-4 text-[#E0F7FF]">Đăng ký nhận tin tức</h3>
              <p className="text-[#B0D0E8] mb-8 text-lg">
                Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="flex-1 px-4 py-3 rounded-full bg-[#0F2B52]/50 border border-[#00D4FF]/50 text-white placeholder-[#B0D0E8] focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent backdrop-blur-sm"
                />
                <button className="bg-gradient-to-r from-[#00D4FF] to-[#00B8E6] px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 text-[#0A1A2F]">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00D4FF] to-[#00B8E6] rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🛒</span>
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00B8E6] bg-clip-text text-transparent">
                    TechZone
                  </div>
                  <div className="text-xs text-[#B0D0E8]">Future of Shopping</div>
                </div>
              </Link>
              <p className="text-[#B0D0E8] leading-relaxed mb-6">
                Nơi mua sắm công nghệ trực tuyến uy tín với hàng ngàn sản phẩm chất lượng,
                dịch vụ khách hàng tận tâm và trải nghiệm mua sắm tuyệt vời.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-[#0F2B52]/50 rounded-full flex items-center justify-center hover:bg-[#00D4FF] transition-colors duration-300 backdrop-blur-sm">
                  <span className="text-lg">📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-[#0F2B52]/50 rounded-full flex items-center justify-center hover:bg-[#FF6B6B] transition-colors duration-300 backdrop-blur-sm">
                  <span className="text-lg">📸</span>
                </a>
                <a href="#" className="w-10 h-10 bg-[#0F2B52]/50 rounded-full flex items-center justify-center hover:bg-[#00B8E6] transition-colors duration-300 backdrop-blur-sm">
                  <span className="text-lg">🐦</span>
                </a>
                <a href="#" className="w-10 h-10 bg-[#0F2B52]/50 rounded-full flex items-center justify-center hover:bg-[#FF6B6B] transition-colors duration-300 backdrop-blur-sm">
                  <span className="text-lg">📺</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-[#00D4FF]">Danh mục sản phẩm</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/danh-muc/dien-thoai" className="text-[#B0D0E8] hover:text-[#E0F7FF] transition-colors duration-200 flex items-center space-x-2">
                    <span>📱</span>
                    <span>Điện thoại</span>
                  </Link>
                </li>
                <li>
                  <Link href="/danh-muc/laptop" className="text-[#B0D0E8] hover:text-[#E0F7FF] transition-colors duration-200 flex items-center space-x-2">
                    <span>💻</span>
                    <span>Laptop</span>
                  </Link>
                </li>
                <li>
                  <Link href="/danh-muc/may-tinh-bang" className="text-[#B0D0E8] hover:text-[#E0F7FF] transition-colors duration-200 flex items-center space-x-2">
                    <span>📲</span>
                    <span>Máy tính bảng</span>
                  </Link>
                </li>
                <li>
                  <Link href="/danh-muc/phu-kien" className="text-[#B0D0E8] hover:text-[#E0F7FF] transition-colors duration-200 flex items-center space-x-2">
                    <span>🎧</span>
                    <span>Phụ kiện</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-[#00B8E6]">Hỗ trợ khách hàng</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/lien-he" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                    <span>📞</span>
                    <span>Liên hệ</span>
                  </Link>
                </li>
                <li>
                  <Link href="/chinh-sach" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                    <span>📋</span>
                    <span>Chính sách</span>
                  </Link>
                </li>
                <li>
                  <Link href="/huong-dan" className="text-[#B0D0E8] hover:text-[#E0F7FF] transition-colors duration-200 flex items-center space-x-2">
                    <span>📖</span>
                    <span>Hướng dẫn mua hàng</span>
                  </Link>
                </li>
                <li>
                  <Link href="/bao-hanh" className="text-[#B0D0E8] hover:text-[#E0F7FF] transition-colors duration-200 flex items-center space-x-2">
                    <span>🛡️</span>
                    <span>Bảo hành</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-[#FF6B6B]">Thông tin liên hệ</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-[#00D4FF] text-lg mt-1">📍</span>
                  <div>
                    <p className="text-[#B0D0E8]">123 Đường ABC, Quận XYZ</p>
                    <p className="text-[#B0D0E8]">TP. Hồ Chí Minh, Việt Nam</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[#00B8E6] text-lg">📞</span>
                  <span className="text-[#B0D0E8]">1900-xxxx</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[#FF6B6B] text-lg">✉️</span>
                  <span className="text-[#B0D0E8]">support@techzone.vn</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[#00D4FF] text-lg">🕒</span>
                  <span className="text-[#B0D0E8]">8:00 - 22:00 (T2-CN)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#00D4FF]/20">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-[#B0D0E8] text-sm">
                © 2024 TechZone. Tất cả quyền được bảo lưu.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <Link href="/dieu-khoan" className="text-[#B0D0E8] hover:text-[#E0F7FF] text-sm transition-colors duration-200">
                  Điều khoản sử dụng
                </Link>
                <Link href="/bao-mat" className="text-[#B0D0E8] hover:text-[#E0F7FF] text-sm transition-colors duration-200">
                  Chính sách bảo mật
                </Link>
                <Link href="/van-chuyen" className="text-[#B0D0E8] hover:text-[#E0F7FF] text-sm transition-colors duration-200">
                  Chính sách vận chuyển
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}