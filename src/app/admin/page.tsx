// This file redirects to /admin/dashboard
// All admin functionality is in /admin/dashboard
import { redirect } from 'next/navigation';

export default function AdminPage() {
  redirect('/admin/dashboard');
}

type Order = {
  _id: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt?: string;
  user?: {
    name?: string;
    email?: string;
  };
};

type Coupon = {
  _id: string;
  code: string;
  type: 'percent' | 'amount' | string;
  value: number;
  expiresAt?: string;
  minSubtotal?: number;
  active?: boolean;
};

export default function AdminPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percent',
    value: 0,
    expiresAt: '',
    minSubtotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  const isAdmin = user && (user as any).role === 'admin';
  
  // Check if running on admin port (3001)
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  useEffect(() => {
    // Check port to determine if in admin mode
    if (typeof window !== 'undefined') {
      const port = window.location.port;
      setIsAdminMode(port === '3001');
    }
  }, []);

  useEffect(() => {
    // If running in admin mode (port 3001), skip auth check
    if (!isAdminMode && !token) return;
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const [orderResp, productResp, couponResp, usersResp] = await Promise.all([
          fetch('/api/orders', { headers }),
          fetch('/api/products', { headers }),
          fetch('/api/coupons', { headers }),
          fetch('/api/admin/users', { headers }),
        ]);

        const orderData = await orderResp.json();
        if (orderResp.ok && orderData.orders) {
          setOrders(orderData.orders);
        } else if (!orderResp.ok) {
          setError(orderData.error || 'Không thể tải đơn hàng');
        }

        const productData = await productResp.json();
        if (productData.products) setProducts(productData.products);

        const couponData = await couponResp.json();
        if (couponData.coupons) setCoupons(couponData.coupons);

        const usersData = await usersResp.json();
        if (usersData.users) setUsers(usersData.users);
      } catch (e: any) {
        setError(e?.message || 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, isAdminMode]);

  const handleCouponChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setCouponForm(prev => ({
      ...prev,
      [name]:
        name === 'value' || name === 'minSubtotal'
          ? Number(value)
          : value,
    }));
  };

  const createCoupon = async () => {
    if (!token) return;
    try {
      setCreatingCoupon(true);
      setError('');
      const resp = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(couponForm),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Không thể tạo mã giảm giá');
      }
      setCoupons(prev => [...prev, data.coupon as Coupon]);
      setCouponForm({
        code: '',
        type: 'percent',
        value: 0,
        expiresAt: '',
        minSubtotal: 0,
      });
    } catch (e: any) {
      setError(e?.message || 'Lỗi khi tạo mã giảm giá');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const toggleCouponActive = async (coupon: Coupon) => {
    if (!token) return;
    try {
      const resp = await fetch('/api/coupons', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: coupon._id,
          updates: { active: !coupon.active },
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Không thể cập nhật mã giảm giá');
      }
      setCoupons(prev =>
        prev.map(c => (c._id === coupon._id ? (data.coupon as Coupon) : c)),
      );
    } catch (e: any) {
      setError(e?.message || 'Lỗi khi cập nhật mã giảm giá');
    }
  };

  const deleteCoupon = async (coupon: Coupon) => {
    if (!token) return;
    if (!window.confirm(`Xóa mã giảm giá ${coupon.code}?`)) return;
    try {
      const resp = await fetch(`/api/coupons?id=${coupon._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Không thể xóa mã giảm giá');
      }
      setCoupons(prev => prev.filter(c => c._id !== coupon._id));
    } catch (e: any) {
      setError(e?.message || 'Lỗi khi xóa mã giảm giá');
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    if (!token) return;
    try {
      setSavingOrderId(orderId);
      setError('');
      const resp = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: orderId, updates }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Không thể cập nhật đơn hàng');
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? (data.order as Order) : o)),
      );
    } catch (e: any) {
      setError(e?.message || 'Lỗi khi cập nhật đơn hàng');
    } finally {
      setSavingOrderId(null);
    }
  };

  const shortId = (id: string) => (id ? id.slice(-6) : '');

  // Skip auth check if running in standalone admin mode (port 3001)
  if (!isAdminMode) {
    if (!user) {
      return (
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <p>Vui lòng đăng nhập để truy cập trang quản trị.</p>
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <p>Tài khoản của bạn không có quyền quản trị.</p>
        </div>
      );
    }
  }

  const totalRevenue = orders
    .filter(o => o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockCount = products.filter(p => (p.stock || 0) < 10).length;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">🎛️ Admin Dashboard</h1>
        <div className="text-sm text-gray-600">
          {user?.name ? `Xin chào, ${user.name}` : 'Admin Mode'}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/products" className="bg-blue-500 text-white p-6 rounded-lg hover:bg-blue-600 text-center">
          <div className="text-3xl mb-2">📦</div>
          <div className="font-bold">Sản phẩm</div>
        </Link>
        <Link href="/admin/orders" className="bg-green-500 text-white p-6 rounded-lg hover:bg-green-600 text-center">
          <div className="text-3xl mb-2">📋</div>
          <div className="font-bold">Đơn hàng</div>
        </Link>
        <Link href="/admin/users" className="bg-purple-500 text-white p-6 rounded-lg hover:bg-purple-600 text-center">
          <div className="text-3xl mb-2">👥</div>
          <div className="font-bold">Người dùng</div>
        </Link>
        <Link href="/admin/analytics" className="bg-orange-500 text-white p-6 rounded-lg hover:bg-orange-600 text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="font-bold">Analytics</div>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 text-gray-600 text-sm">Đang tải dữ liệu…</div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/admin/users" className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Người dùng</div>
              <div className="text-4xl font-bold mt-2">{users.length}</div>
              <div className="text-xs mt-2 opacity-75">
                {users.filter(u => u.role === 'seller').length} sellers
              </div>
            </div>
            <div className="text-5xl opacity-20">👥</div>
          </div>
        </Link>

        <Link href="/admin/products" className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Sản phẩm</div>
              <div className="text-4xl font-bold mt-2">{products.length}</div>
              <div className="text-xs mt-2 opacity-75">
                {lowStockCount} sắp hết hàng
              </div>
            </div>
            <div className="text-5xl opacity-20">📦</div>
          </div>
        </Link>

        <Link href="/admin/orders" className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Đơn hàng</div>
              <div className="text-4xl font-bold mt-2">{orders.length}</div>
              <div className="text-xs mt-2 opacity-75">
                {orders.filter(o => o.orderStatus === 'pending').length} chờ xử lý
              </div>
            </div>
            <div className="text-5xl opacity-20">🛍️</div>
          </div>
        </Link>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Doanh thu</div>
              <div className="text-4xl font-bold mt-2">
                {(totalRevenue / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs mt-2 opacity-75">Đơn hoàn thành</div>
            </div>
            <div className="text-5xl opacity-20">💰</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/users" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
          <div className="text-2xl mb-2">👥</div>
          <div className="font-semibold">Quản lý người dùng</div>
          <div className="text-sm text-gray-600">Xem, chỉnh sửa role, khóa tài khoản</div>
        </Link>
        <Link href="/admin/products" className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors">
          <div className="text-2xl mb-2">📦</div>
          <div className="font-semibold">Quản lý sản phẩm</div>
          <div className="text-sm text-gray-600">Xem, ẩn/hiện, xóa sản phẩm</div>
        </Link>
        <Link href="/admin/orders" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
          <div className="text-2xl mb-2">🛍️</div>
          <div className="font-semibold">Quản lý đơn hàng</div>
          <div className="text-sm text-gray-600">Xem, cập nhật trạng thái đơn</div>
        </Link>
      </div>

      {/* Orders */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Đơn hàng gần đây</h2>
        {orders.length === 0 ? (
          <div>Không có đơn hàng</div>
        ) : (
          <ul className="space-y-3">
            {orders.map(o => (
              <li
                key={o._id}
                className="p-4 border rounded flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm"
              >
                <div className="space-y-1">
                  <div className="font-semibold">
                    Đơn #{shortId(o._id)} —{' '}
                    <span className="text-red-600">
                      {o.totalAmount?.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  <div className="text-gray-700">
                    Trạng thái đơn: {o.orderStatus}{' '}
                    | Thanh toán: {o.paymentStatus || 'pending'} (
                    {o.paymentMethod || 'N/A'})
                  </div>
                  {o.user && (
                    <div className="text-gray-600">
                      Khách hàng: {o.user.name || ''}{' '}
                      {o.user.email ? `(${o.user.email})` : ''}
                    </div>
                  )}
                  {o.createdAt && (
                    <div className="text-gray-500 text-xs">
                      Ngày tạo:{' '}
                      {new Date(o.createdAt).toLocaleString('vi-VN')}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {o.paymentStatus !== 'paid' && (
                    <button
                      onClick={() =>
                        updateOrder(o._id, {
                          paymentStatus: 'paid',
                          orderStatus:
                            o.orderStatus === 'pending'
                              ? 'processing'
                              : o.orderStatus,
                        })
                      }
                      disabled={savingOrderId === o._id}
                      className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Đánh dấu đã thanh toán
                    </button>
                  )}
                  {o.orderStatus === 'pending' && (
                    <button
                      onClick={() =>
                        updateOrder(o._id, { orderStatus: 'processing' })
                      }
                      disabled={savingOrderId === o._id}
                      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      Xử lý đơn
                    </button>
                  )}
                  {o.orderStatus === 'processing' && (
                    <button
                      onClick={() =>
                        updateOrder(o._id, { orderStatus: 'shipped' })
                      }
                      disabled={savingOrderId === o._id}
                      className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Đã gửi hàng
                    </button>
                  )}
                  {o.orderStatus === 'shipped' && (
                    <button
                      onClick={() =>
                        updateOrder(o._id, { orderStatus: 'delivered' })
                      }
                      disabled={savingOrderId === o._id}
                      className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Đã giao
                    </button>
                  )}
                  {o.orderStatus !== 'cancelled' && (
                    <button
                      onClick={() =>
                        updateOrder(o._id, { orderStatus: 'cancelled' })
                      }
                      disabled={savingOrderId === o._id}
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Hủy đơn
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Coupons */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Mã giảm giá</h2>
        <div className="bg-white p-4 rounded border mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                Mã
              </label>
              <input
                name="code"
                value={couponForm.code}
                onChange={handleCouponChange}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="SALE2025"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Loại
              </label>
              <select
                name="type"
                value={couponForm.type}
                onChange={handleCouponChange}
                className="w-full border rounded px-2 py-1 text-sm"
              >
                <option value="percent">% phần trăm</option>
                <option value="amount">Số tiền cố định</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Giá trị
              </label>
              <input
                type="number"
                name="value"
                value={couponForm.value}
                onChange={handleCouponChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Đơn tối thiểu
              </label>
              <input
                type="number"
                name="minSubtotal"
                value={couponForm.minSubtotal}
                onChange={handleCouponChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium mb-1">
                Hết hạn
              </label>
              <input
                type="date"
                name="expiresAt"
                value={couponForm.expiresAt}
                onChange={handleCouponChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={createCoupon}
                disabled={creatingCoupon}
                className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingCoupon ? 'Đang tạo...' : 'Tạo mã'}
              </button>
            </div>
          </div>
        </div>

        <div>
          {coupons.length === 0 ? (
            <div>Chưa có mã giảm giá</div>
          ) : (
            <ul className="space-y-2">
              {coupons.map(c => (
                <li
                  key={c._id}
                  className="p-3 border rounded flex justify-between items-center text-sm"
                >
                  <div>
                    <div className="font-semibold">
                      {c.code} —{' '}
                      {c.type === 'percent'
                        ? `${c.value}%`
                        : `${c.value.toLocaleString('vi-VN')}₫`}
                    </div>
                    <div className="text-gray-600">
                      {c.expiresAt
                        ? `Hết hạn: ${new Date(
                            c.expiresAt,
                          ).toLocaleDateString('vi-VN')}`
                        : 'Không giới hạn thời gian'}
                    </div>
                    {typeof c.minSubtotal === 'number' && c.minSubtotal > 0 && (
                      <div className="text-gray-500 text-xs">
                        Áp dụng cho đơn từ{' '}
                        {c.minSubtotal.toLocaleString('vi-VN')}₫
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleCouponActive(c)}
                      className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 text-xs"
                    >
                      {c.active ? 'Vô hiệu' : 'Kích hoạt'}
                    </button>
                    <button
                      onClick={() => deleteCoupon(c)}
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-xs"
                    >
                      Xóa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Products overview */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Sản phẩm</h2>
        {products.length === 0 ? (
          <div>Không có sản phẩm</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p: any) => (
              <li key={p._id} className="p-3 border rounded text-sm">
                <div className="font-semibold">{p.name}</div>
                <div className="text-gray-700">
                  {p.price?.toLocaleString('vi-VN')}₫
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
