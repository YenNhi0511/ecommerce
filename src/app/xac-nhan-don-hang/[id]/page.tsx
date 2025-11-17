import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default function OrderConfirmationPage({ params }: PageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-4">Đặt hàng thành công!</h1>
        <p className="text-gray-600 mb-6">
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Chi tiết đơn hàng</h2>
          <div className="text-left space-y-2">
            <p><strong>Mã đơn hàng:</strong> #{params.id}</p>
            <p><strong>Trạng thái:</strong> Đang xử lý</p>
            <p><strong>Thời gian đặt:</strong> {new Date().toLocaleString('vi-VN')}</p>
            <p><strong>Tổng tiền:</strong> 30.000.000đ</p>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Bạn sẽ nhận được email xác nhận đơn hàng trong vài phút tới.
          Chúng tôi sẽ thông báo khi đơn hàng được giao.
        </p>

        <div className="space-x-4">
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
            Tiếp tục mua sắm
          </Link>
          <Link href="/tai-khoan" className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700">
            Xem đơn hàng
          </Link>
        </div>
      </div>
    </div>
  );
}