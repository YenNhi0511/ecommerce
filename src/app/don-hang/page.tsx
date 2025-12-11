"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface OrderItem {
  product:
    | {
        _id?: string;
        name?: string;
      }
    | string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt?: string;
  paymentMethod?: string;
}

/**
 * Trang /don-hang
 * - Hiển thị lịch sử đơn hàng của user hiện tại.
 */
export default function OrdersPage() {
  const { token, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Đợi AuthContext load xong
    if (isLoading) return;

    if (!token) {
      alert("Bạn cần đăng nhập để xem lịch sử đơn hàng.");
      router.push("/dang-nhap");
      return;
    }

    (async () => {
      try {
        const resp = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = (await resp.json()) as {
          orders?: Order[];
          error?: string;
        };

        if (!resp.ok) {
          throw new Error(
            data.error || "Không thể tải danh sách đơn hàng"
          );
        }

        setOrders(data.orders ?? []);
      } catch (err: unknown) {
        console.error(err);
        const message =
          err instanceof Error
            ? err.message
            : "Đã xảy ra lỗi khi tải đơn hàng";
        alert(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, isLoading, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        Đang tải đơn hàng...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Lịch sử đơn hàng</h1>

      {orders.length === 0 ? (
        <p>Hiện bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-semibold">
                    Đơn hàng #{order._id}
                  </div>
                  <div className="text-sm text-gray-500">
                    Ngày đặt:{" "}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </div>
                </div>

                <div className="text-right text-sm">
                  <div>
                    Thanh toán:{" "}
                    <span className="font-semibold">
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div>
                    Trạng thái:{" "}
                    <span className="font-semibold">
                      {order.orderStatus}
                    </span>
                  </div>
                  <div>
                    Tổng:{" "}
                    <span className="font-semibold">
                      {Number(
                        order.totalAmount
                      ).toLocaleString("vi-VN")}
                      ₫
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-2">
                Phương thức thanh toán:{" "}
                {order.paymentMethod?.toUpperCase?.() ||
                  order.paymentMethod ||
                  "N/A"}
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-600">
                  Số sản phẩm: {order.items?.length ?? 0}
                </div>
                <Link
                  href={`/xac-nhan-don-hang/${order._id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
