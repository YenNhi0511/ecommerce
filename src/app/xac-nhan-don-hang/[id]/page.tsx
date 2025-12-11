"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
}

/**
 * Trang xác nhận đơn hàng sau khi thanh toán (MoMo / Stripe).
 * - Đợi AuthContext load xong (isLoading === false) rồi mới gọi API.
 * - Nếu không có token thì bắt đăng nhập lại.
 */
export default function OrderConfirmation() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const { token, isLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    // Đợi AuthContext load xong
    if (isLoading) return;

    // Đã load xong nhưng không có token -> yêu cầu đăng nhập
    if (!token) {
      alert("Bạn cần đăng nhập để xem chi tiết đơn hàng.");
      router.push("/dang-nhap");
      return;
    }

    (async () => {
      try {
        // Nếu redirect từ Stripe với session_id thì xác nhận session trước
        const search = new URL(window.location.href).searchParams;
        const sessionId = search.get("session_id");
        if (sessionId) {
          await fetch(
            `/api/payments/session/${encodeURIComponent(sessionId)}`
          );
        }

        const resp = await fetch(`/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = (await resp.json()) as { order: Order; error?: string };

        if (!resp.ok) {
          throw new Error(data.error || "Không thể lấy đơn hàng");
        }

        setOrder(data.order);
      } catch (err: unknown) {
        console.error(err);
        const message =
          err instanceof Error ? err.message : "Đã xảy ra lỗi";
        alert(message);
        router.push("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token, isLoading, router]);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!order) return <div className="p-6">Không tìm thấy đơn hàng</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Xác nhận đơn hàng</h1>
      <div className="bg-white p-6 rounded shadow">
        <div className="mb-3">
          Mã đơn: <strong>{order._id}</strong>
        </div>
        <div className="mb-3">
          Trạng thái thanh toán:{" "}
          <strong>{order.paymentStatus}</strong>
        </div>
        <div className="mb-3">
          Trạng thái đơn hàng:{" "}
          <strong>{order.orderStatus}</strong>
        </div>
        <div className="mb-3">
          Tổng:{" "}
          <strong>
            {Number(order.totalAmount).toLocaleString("vi-VN")}₫
          </strong>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Sản phẩm</h3>
          <ul>
            {order.items.map((it) => (
              <li
                key={
                  typeof it.product === "string"
                    ? it.product
                    : it.product._id ?? Math.random().toString()
                }
                className="py-2 border-b"
              >
                <div className="flex justify-between">
                  <div>
                    {typeof it.product === "string"
                      ? it.product
                      : it.product.name ?? ""}
                  </div>
                  <div>
                    {it.quantity} ×{" "}
                    {Number(it.price).toLocaleString("vi-VN")}₫
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
