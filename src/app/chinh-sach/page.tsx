export default function PoliciesPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-[4%] py-8">
      <h1 className="text-3xl font-bold mb-6">Chính sách và Điều khoản</h1>

      <div className="prose max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Chính sách đổi trả</h2>
          <p className="mb-4">
            TMĐT Shop cam kết đổi trả sản phẩm trong vòng 30 ngày kể từ ngày nhận hàng với các điều kiện sau:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Sản phẩm còn nguyên vẹn, chưa qua sử dụng</li>
            <li>Còn đầy đủ tem mác, hộp đựng và phụ kiện đi kèm</li>
            <li>Có hóa đơn mua hàng</li>
            <li>Lý do đổi trả hợp lý (sản phẩm lỗi, không đúng mô tả)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Chính sách vận chuyển</h2>
          <p className="mb-4">
            Chúng tôi cung cấp dịch vụ giao hàng trên toàn quốc với các phương thức:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Giao hàng tiêu chuẩn: 2-3 ngày</li>
            <li>Giao hàng nhanh: 1 ngày</li>
            <li>Giao hàng hỏa tốc: Trong ngày (nội thành)</li>
          </ul>
          <p>Phí vận chuyển sẽ được tính dựa trên địa chỉ giao hàng và trọng lượng sản phẩm.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Chính sách bảo mật</h2>
          <p className="mb-4">
            TMĐT Shop cam kết bảo vệ thông tin cá nhân của khách hàng:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Không chia sẻ thông tin cá nhân với bên thứ ba</li>
            <li>Mã hóa dữ liệu thanh toán</li>
            <li>Cập nhật thường xuyên hệ thống bảo mật</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Điều khoản sử dụng</h2>
          <p className="mb-4">
            Khi sử dụng website TMĐT Shop, bạn đồng ý với các điều khoản sau:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Cung cấp thông tin chính xác khi đăng ký</li>
            <li>Không sử dụng website cho mục đích bất hợp pháp</li>
            <li>Tôn trọng quyền sở hữu trí tuệ</li>
            <li>Tuân thủ các quy định pháp luật Việt Nam</li>
          </ul>
        </section>
      </div>
    </div>
  );
}