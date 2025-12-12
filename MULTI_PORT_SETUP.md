# 🚀 Hướng Dẫn Chạy Đa Port - Multi-Port Setup

## 📋 Cấu Hình Ports

| Port     | Vai trò              | Mô tả                                             | Command                 |
| -------- | -------------------- | ------------------------------------------------- | ----------------------- |
| **3000** | 👤 **User/Customer** | Giao diện mua sắm cho khách hàng                  | `npm run dev:user`      |
| **3001** | 🛡️ **Admin**         | Quản trị hệ thống, quản lý users/products/orders  | `npm run dev:admin`     |
| **3002** | 🏪 **Seller**        | Giao diện cho người bán hàng                      | `npm run dev:seller`    |
| **3003** | 📊 **Analytics**     | Dashboard phân tích độc lập (không cần đăng nhập) | `npm run dev:analytics` |

---

## 🎯 Chạy Từng Port Riêng Lẻ

### 1️⃣ Port 3000 - Customer Interface

```bash
npm run dev:user
```

**Truy cập:** http://localhost:3000
**Hiển thị:**

- Homepage với sản phẩm nổi bật
- Danh mục sản phẩm
- Giỏ hàng, thanh toán
- Trang sản phẩm chi tiết

---

### 2️⃣ Port 3001 - Admin Dashboard

```bash
npm run dev:admin
```

**Truy cập:** http://localhost:3001
**Auto redirect:** http://localhost:3001/admin
**Chức năng:**

- Quản lý Users
- Quản lý Products
- Quản lý Orders
- Dashboard tổng quan

**Yêu cầu:** Đăng nhập với tài khoản admin

---

### 3️⃣ Port 3002 - Seller Dashboard

```bash
npm run dev:seller
```

**Truy cập:** http://localhost:3002
**Auto redirect:** http://localhost:3002/seller
**Chức năng:**

- Quản lý sản phẩm của seller
- Xem đơn hàng của seller
- Thống kê doanh thu

**Yêu cầu:** Đăng nhập với tài khoản seller

---

### 4️⃣ Port 3003 - Analytics Dashboard (Standalone)

```bash
npm run dev:analytics
```

**Truy cập:** http://localhost:3003
**Auto redirect:** http://localhost:3003/admin/analytics
**Chức năng:**

- 📊 Dashboard analytics
- 📈 Conversion funnel
- 🔥 Top viewed products
- 🔍 Top search queries
- 📉 User behavior insights

**✨ Đặc biệt:** Không cần đăng nhập!

---

## 🚀 Chạy Tất Cả Ports Cùng Lúc

```bash
npm run dev:all
```

**Mở 4 terminals song song:**

- Terminal 1: Port 3000 (User)
- Terminal 2: Port 3001 (Admin)
- Terminal 3: Port 3002 (Seller)
- Terminal 4: Port 3003 (Analytics)

**Lưu ý:** Cần cài `concurrently`:

```bash
npm install --save-dev concurrently
```

---

## 🧪 Testing Workflow

### Scenario 1: Customer mua hàng (Port 3000)

1. Mở http://localhost:3000
2. Browse sản phẩm → **Tracked** ✅
3. Thêm vào giỏ → **Tracked** ✅
4. Tìm kiếm → **Tracked** ✅
5. Đặt hàng → **Tracked** ✅

### Scenario 2: Admin quản lý (Port 3001)

1. Mở http://localhost:3001
2. Login admin
3. Quản lý products, users, orders

### Scenario 3: Seller bán hàng (Port 3002)

1. Mở http://localhost:3002
2. Login seller
3. Thêm/sửa sản phẩm
4. Xem đơn hàng

### Scenario 4: Xem Analytics (Port 3003)

1. Mở http://localhost:3003
2. **Không cần login!**
3. Xem real-time analytics
4. Theo dõi conversion funnel
5. Phân tích top products/searches

---

## 🔄 Flow Tracking Data

```
Customer (3000)           Analytics (3003)
    ↓                           ↑
Browse products  ─────→  Track PRODUCT_VIEW
Add to cart     ─────→  Track CART_ADD
Search          ─────→  Track SEARCH
Checkout        ─────→  Track ORDER_COMPLETE
                             │
                             ↓
                    MongoDB UserBehavior
                             │
                             ↓
                    Analytics Dashboard
                    (Real-time updates)
```

---

## 📊 Kiến Trúc Multi-Port

```
┌─────────────────────────────────────────────────┐
│          Next.js Application (Root)              │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐
│  │ Port    │  │ Port    │  │ Port    │  │ Port   │
│  │ 3000    │  │ 3001    │  │ 3002    │  │ 3003   │
│  │ User    │  │ Admin   │  │ Seller  │  │Analytics│
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬───┘
│       │            │            │            │
│       ↓            ↓            ↓            ↓
│  Homepage      /admin       /seller    /admin/analytics
│  Products      Dashboard    Dashboard   (Public)
│  Cart          Users        Products    Metrics
│  Checkout      Orders       Orders      Funnel
│                Products                 Insights
│                                                  │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
         ┌─────────────────┐
         │  MongoDB Atlas  │
         │  - Products     │
         │  - Users        │
         │  - Orders       │
         │  - UserBehavior │
         └─────────────────┘
```

---

## 🛠️ Troubleshooting

### Port đã được sử dụng?

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Hoặc dùng port khác
npm run dev -- -p 3010
```

### MongoDB connection error?

- Kiểm tra `.env` file
- Verify MongoDB URI
- Check network/firewall

### Analytics không có data?

1. Browse products trên port 3000
2. Add to cart
3. Search
4. Refresh analytics dashboard (port 3003)

---

## ✅ Best Practices

### Development

- **Dev thường xuyên:** Chạy `npm run dev:all` để test tất cả
- **Dev specific:** Chỉ chạy port cần thiết để tiết kiệm resources

### Production

- Deploy mỗi port như separate service
- Use reverse proxy (nginx) để route traffic
- Set up load balancing nếu cần

### Testing

- Port 3000: Test customer flow
- Port 3001: Test admin features
- Port 3002: Test seller features
- Port 3003: Verify analytics tracking

---

## 🎉 Quick Start

**Lần đầu setup:**

```bash
# 1. Install dependencies
npm install

# 2. Chạy tất cả ports
npm run dev:all
```

**Access URLs:**

- 👤 Customer: http://localhost:3000
- 🛡️ Admin: http://localhost:3001
- 🏪 Seller: http://localhost:3002
- 📊 Analytics: http://localhost:3003

**Generate test data:**

```bash
# Browse products on port 3000
# Then check analytics on port 3003
```

Done! 🚀
