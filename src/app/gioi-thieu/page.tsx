export default function AboutPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-[4%] py-8">
      <h1 className="text-3xl font-bold mb-6">Giới thiệu về TMĐT Shop</h1>

      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          TMĐT Shop là nền tảng thương mại điện tử hàng đầu Việt Nam, cung cấp các sản phẩm công nghệ chất lượng cao với giá cả cạnh tranh.
        </p>

        <h2 className="text-2xl font-bold mb-4">Sứ mệnh của chúng tôi</h2>
        <p className="mb-6">
          Mang đến cho khách hàng trải nghiệm mua sắm trực tuyến tốt nhất với:
        </p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>Sản phẩm chính hãng, chất lượng đảm bảo</li>
          <li>Dịch vụ khách hàng chuyên nghiệp</li>
          <li>Giao hàng nhanh chóng trên toàn quốc</li>
          <li>Chính sách đổi trả linh hoạt</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4">Lịch sử phát triển</h2>
        <p className="mb-6">
          Thành lập từ năm 2020, TMĐT Shop đã không ngừng phát triển và trở thành một trong những website thương mại điện tử uy tín nhất Việt Nam.
        </p>

        <h2 className="text-2xl font-bold mb-4">Cam kết</h2>
        <p>
          Chúng tôi cam kết mang đến cho khách hàng những sản phẩm và dịch vụ tốt nhất, góp phần thúc đẩy sự phát triển của thương mại điện tử tại Việt Nam.
        </p>
      </div>
    </div>
  );
}