import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import WebhookEvent from "@/models/WebhookEvent";
import { getUserFromRequest } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

interface AuthUser {
  _id: string;
  role?: string;
}

interface OrderDoc {
  _id: string;
  user?: string;
  paymentStatus?: string;
  totalAmount?: number;
  total?: number;
  itemsTotal?: number;
  shippingFee?: number;
  paymentMethod?: string;
}

interface MomoCreateResponse {
  payUrl?: string;
  redirectUrl?: string;
  checkoutUrl?: string;
  deeplink?: string;
  shortLink?: string;
  requestId?: string;
  orderId?: string;
  [key: string]: unknown;
}

/**
 * Create MoMo payment
 * POST /api/payments/momo
 * body: { orderId: string }
 *
 * Implements MoMo "payWithMethod" flow.
 */
export async function POST(request: NextRequest) {
  try {
    // Basic rate limiting by IP
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("host") ||
      "anon";

    const rl = rateLimit(`momo:${ip}`, 10, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = (await request
      .json()
      .catch(() => null)) as { orderId?: string } | null;

    const orderId = body?.orderId;
    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    const user = (await getUserFromRequest(request)) as AuthUser | null;

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const order = (await Order.findById(orderId)) as unknown as
      | OrderDoc
      | null;
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Only allow the owner of the order (or admin) to initiate payment
    if (
      order.user &&
      String(order.user) !== String(user._id) &&
      user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Only unpaid orders can be sent to MoMo
    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Order is already paid" },
        { status: 400 }
      );
    }

    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const endpoint =
      process.env.MOMO_ENDPOINT ??
      "https://test-payment.momo.vn/v2/gateway/api/create";

    if (!partnerCode || !accessKey || !secretKey) {
      return NextResponse.json(
        { error: "MoMo credentials not configured" },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const orderIdStr = String(order._id);
    const requestId = `${partnerCode}-${Date.now()}`;

    // Tính amount từ totalAmount, nếu không có thì dùng itemsTotal, cuối cùng fallback sang total
    const computedAmountNumber =
      typeof order.totalAmount === "number" && !Number.isNaN(order.totalAmount)
        ? order.totalAmount
        : typeof order.itemsTotal === "number" &&
          !Number.isNaN(order.itemsTotal)
        ? order.itemsTotal
        : typeof order.total === "number" && !Number.isNaN(order.total)
        ? order.total
        : 0;

    const amount = String(Math.max(0, Math.round(computedAmountNumber)));
    const orderInfo = `Thanh toán đơn hàng ${orderIdStr}`;
    const requestType = "payWithMethod";
    const extraData = "";

    // URL frontend sau khi thanh toán xong trên MoMo
    const redirectUrl = `${baseUrl}/xac-nhan-don-hang/${orderIdStr}`;

    // URL IPN để MoMo gọi kết quả thanh toán
    const ipnUrl =
      process.env.MOMO_IPN_URL ||
      `${baseUrl}/api/payments/momo/notify`;

    // Chuỗi ký
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderIdStr}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const payload = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId: orderIdStr,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let data: MomoCreateResponse | null = null;
    try {
      data = (await res.json()) as MomoCreateResponse;
    } catch (e) {
      console.error("MoMo create parse error:", e);
    }

    if (!res.ok || !data) {
      console.error("MoMo create error", {
        status: res.status,
        text: await res.text().catch(() => ""),
      });
      return NextResponse.json(
        { error: "Failed to create MoMo payment" },
        { status: 502 }
      );
    }

    // Lưu log sự kiện create để admin xem
    try {
      await WebhookEvent.create({
        provider: "momo",
        eventId: String(data.requestId || data.orderId || orderIdStr),
        type: "momo.create",
        raw: JSON.stringify(data),
        metadata: { orderId: orderIdStr },
      });
    } catch (e) {
      console.warn("Failed to persist momo create event", e);
    }

    const payUrl =
      data.payUrl ||
      data.redirectUrl ||
      data.checkoutUrl ||
      data.deeplink ||
      data.shortLink;

    if (!payUrl) {
      console.error("MoMo response missing payUrl", data);
      return NextResponse.json(
        { error: "MoMo did not return a payment URL" },
        { status: 502 }
      );
    }

    return NextResponse.json({ payUrl, raw: data });
  } catch (err: unknown) {
    console.error("MoMo create error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
