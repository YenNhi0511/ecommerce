"use client"
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function MoMoTestPage() {
  const search = useSearchParams();
  const orderId = search.get('orderId');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [orderId]);

  const copy = async () => {
    if (!orderId) return;
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-[1400px] mx-auto px-[4%]">
        <div className="bg-white rounded shadow p-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-3">Hỗ trợ kiểm thử MoMo (Sandbox)</h1>
          <p className="text-sm text-gray-600 mb-4">Bạn đã chọn thanh toán bằng ATM / MoMo. Ở môi trường phát triển, bạn có thể dùng hướng dẫn sandbox của MoMo để mô phỏng thanh toán.</p>

          {orderId && (
            <div className="mb-4 p-3 border rounded bg-gray-50">
              <div className="text-xs text-gray-500">Order ID</div>
              <div className="flex items-center justify-between">
                <div className="font-mono font-medium">{orderId}</div>
                <button onClick={copy} className="ml-4 px-3 py-1 border rounded bg-blue-600 text-white">{copied ? 'Copied' : 'Copy'}</button>
              </div>
              <div className="text-xs text-gray-500 mt-2">Sử dụng Order ID này khi bạn thử nghiệm hoặc gửi cho bộ phận test.</div>
            </div>
          )}

          <h2 className="font-semibold">Các bước kiểm thử nhanh</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-sm text-gray-700">
            <li>Đọc hướng dẫn sandbox chính thức: <a className="text-blue-600" href="https://github.com/momo-wallet/payment/" target="_blank" rel="noreferrer">MoMo payment sandbox</a>.</li>
            <li>Chuẩn bị thông tin theo hướng dẫn (app id, secret sandbox nếu cần).</li>
            <li>Sử dụng Order ID phía trên để liên kết thử nghiệm thanh toán với đơn hàng này.</li>
            <li>Sau khi hoàn thành mô phỏng thanh toán ở sandbox, kiểm tra trạng thái đơn hàng trong trang quản trị hoặc bằng API `/api/orders/{orderId}`.</li>
          </ol>

          <div className="mt-6 flex gap-2">
            <a href="https://github.com/momo-wallet/payment/" target="_blank" rel="noreferrer" className="px-4 py-2 bg-gray-100 rounded">Mở repo MoMo sandbox</a>
            <a href="/xac-nhan-don-hang" className="px-4 py-2 bg-blue-600 text-white rounded">Quay về trang đơn hàng</a>
          </div>
        </div>
      </div>
    </div>
  )
}
