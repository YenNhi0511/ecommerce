"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Order = {
  _id: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt?: string;
  shippingAddress?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
  };
};

type Product = {
  _id: string;
  name: string;
  price: number;
};

type ProductsResponse = {
  products?: Product[];
  error?: string;
};

type OrdersResponse = {
  orders?: Order[];
  error?: string;
};

export default function SellerPage() {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const isSeller = user?.role === "seller";

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");

      const [prodResp, orderResp] = await Promise.all([
        fetch("/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const prodData = (await prodResp.json()) as ProductsResponse;
      if (prodData.products) setProducts(prodData.products);

      const orderData = (await orderResp.json()) as OrdersResponse;
      if (orderResp.ok && orderData.orders) {
        setOrders(orderData.orders);
      } else if (!orderResp.ok) {
        setError(orderData.error || "Không thể tải đơn hàng");
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Lỗi khi tải dữ liệu";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!token) return;
    try {
      setSavingOrderId(orderId);
      setError("");

      const resp = await fetch("/api/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: orderId,
          updates: { orderStatus: status },
        }),
      });

      const data = (await resp.json()) as { order?: Order; error?: string };

      if (!resp.ok || !data.order) {
        throw new Error(
          data.error || "Không thể cập nhật đơn hàng"
        );
      }

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? data.order as Order : o))
      );
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : "Lỗi khi cập nhật đơn hàng";
      setError(message);
    } finally {
      setSavingOrderId(null);
    }
  };

  const shortId = (id: string) => (id ? id.slice(-6) : "");

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
        <p>Vui lòng đăng nhập để truy cập trang người bán.</p>
      </div>
    );
  }

  if (!isSeller) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
        <p>Tài khoản của bạn không có quyền người bán.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 text-gray-600 text-sm">
          Đang tải dữ liệu…
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-sm opacity-90">Tổng sản phẩm</div>
          <div className="text-3xl font-bold mt-2">{products.length}</div>
          <div className="text-xs mt-1 opacity-75">Trong hệ thống</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-sm opacity-90">Tổng đơn hàng</div>
          <div className="text-3xl font-bold mt-2">{orders.length}</div>
          <div className="text-xs mt-1 opacity-75">Tất cả trạng thái</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-sm opacity-90">Đơn chờ xử lý</div>
          <div className="text-3xl font-bold mt-2">{orders.filter(o => o.orderStatus === 'pending').length}</div>
          <div className="text-xs mt-1 opacity-75">Cần xác nhận</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-sm opacity-90">Doanh thu</div>
          <div className="text-3xl font-bold mt-2">
            {(orders.filter(o => o.orderStatus === 'delivered').reduce((sum, o) => sum + (o.totalAmount || 0), 0) / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs mt-1 opacity-75">Đơn đã giao</div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Sản phẩm trong hệ thống</h2>
          <a href="/seller/products" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            📦 Quản lý sản phẩm
          </a>
        </div>
        {products.length === 0 ? (
          <div className="text-gray-500">Chưa có sản phẩm nào.</div>
        ) : (
          <>
            <div className="mb-3 text-sm text-gray-600">
              Hiển thị 12 sản phẩm gần nhất
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.slice(0, 12).map((p) => (
                <li key={p._id} className="p-3 border rounded hover:shadow-lg transition-shadow">
                  <img src={p.images?.[0] || '/favicon.svg'} alt={p.name} className="w-full h-32 object-cover rounded mb-2" />
                  <div className="font-semibold text-sm line-clamp-2">{p.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{p.brand}</div>
                  <div className="text-red-600 font-bold mt-1">
                    {p.price.toLocaleString("vi-VN")}₫
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className={`px-2 py-0.5 rounded ${(p.stock || 0) > 10 ? 'bg-green-100 text-green-700' : (p.stock || 0) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      Kho: {p.stock || 0}
                    </span>
                    <span className="text-gray-500">Bán: {p.sold || 0}</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Đơn hàng liên quan</h2>
        {orders.length === 0 ? (
          <div>Không có đơn hàng</div>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li
                key={o._id}
                className="p-4 border rounded flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div className="space-y-1 text-sm">
                  <div className="font-semibold">
                    Đơn #{shortId(o._id)} —{" "}
                    <span className="text-red-600">
                      {o.totalAmount?.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <div className="text-gray-700">
                    Trạng thái: {o.orderStatus} | Thanh toán:{" "}
                    {o.paymentStatus || "pending"} (
                    {o.paymentMethod || "N/A"})
                  </div>
                  {o.shippingAddress && (
                    <div className="text-gray-600">
                      Khách: {o.shippingAddress.name || ""}{" "}
                      {o.shippingAddress.phone
                        ? `(${o.shippingAddress.phone})`
                        : ""}
                      <br />
                      Địa chỉ:{" "}
                      {[
                        o.shippingAddress.address,
                        o.shippingAddress.city,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                  {o.createdAt && (
                    <div className="text-gray-500 text-xs">
                      Ngày tạo:{" "}
                      {new Date(o.createdAt).toLocaleString("vi-VN")}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  {o.orderStatus === "pending" && (
                    <button
                      onClick={() =>
                        void updateOrderStatus(o._id, "processing")
                      }
                      disabled={savingOrderId === o._id}
                      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      Xác nhận xử lý
                    </button>
                  )}
                  {o.orderStatus === "processing" && (
                    <button
                      onClick={() =>
                        void updateOrderStatus(o._id, "shipped")
                      }
                      disabled={savingOrderId === o._id}
                      className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Đánh dấu đã gửi hàng
                    </button>
                  )}
                  {(o.orderStatus === "shipped" ||
                    o.orderStatus === "processing") && (
                    <button
                      onClick={() =>
                        void updateOrderStatus(o._id, "delivered")
                      }
                      disabled={savingOrderId === o._id}
                      className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Đã giao thành công
                    </button>
                  )}
                  {o.orderStatus !== "delivered" && (
                    <button
                      onClick={() =>
                        void updateOrderStatus(o._id, "cancelled")
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
    </div>
  );
}
