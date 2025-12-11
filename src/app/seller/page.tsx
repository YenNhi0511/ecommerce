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

      <section>
        <h2 className="text-xl font-semibold mb-2">Sản phẩm của bạn</h2>
        {products.length === 0 ? (
          <div>Chưa có sản phẩm nào.</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <li key={p._id} className="p-3 border rounded">
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600">
                  {p.price.toLocaleString("vi-VN")}₫
                </div>
              </li>
            ))}
          </ul>
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
