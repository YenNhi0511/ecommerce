import Link from 'next/link';

export default async function PromotionsPage() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/coupons`, { cache: 'no-store' });
    const data = await res.json();
    const coupons = data?.coupons || [];

    return (
      <div className="max-w-[1400px] mx-auto px-[4%] p-6">
        <h1 className="text-2xl font-bold mb-4">Khuyến mãi</h1>
        {coupons.length === 0 ? (
          <div className="bg-white p-6 rounded shadow">Không có khuyến mãi nào hiện tại.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {coupons.map((c: any) => (
              <div key={c._id} className="bg-white p-4 rounded shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{c.code}</div>
                    <div className="text-sm text-gray-600">{c.description || 'Giảm giá đặc biệt'}</div>
                  </div>
                  <div className="text-indigo-600 font-bold">{c.amount}{c.type === 'percent' ? '%' : 'đ'}</div>
                </div>
                <div className="mt-3 text-sm text-gray-500">HSD: {new Date(c.expiresAt || c.endDate || Date.now()).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6">
          <Link href="/" className="text-blue-600">Quay lại trang chủ</Link>
        </div>
      </div>
    );
  } catch (e) {
    return (
      <div className="max-w-[1400px] mx-auto px-[4%] p-6">
        <h1 className="text-2xl font-bold mb-4">Khuyến mãi</h1>
        <div className="bg-white p-6 rounded shadow">Không thể tải khuyến mãi. Vui lòng thử lại sau.</div>
      </div>
    );
  }
}
