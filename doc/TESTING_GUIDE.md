# 🧪 TESTING GUIDE - HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ

## 🚀 QUICK START

### 1. Khởi động hệ thống đã tối ưu:

```bash
# Windows
.\start-optimized.bat

# Hoặc manual
npm run dev:admin   # Port 3001
```

### 2. Truy cập Admin:

```
URL: http://localhost:3001
Email: admin@techzone.com
Password: admin123
```

---

## ✅ TESTING CHECKLIST

### 🔐 Authentication Tests

#### Test 1: Admin Login

**Steps:**

1. Truy cập `http://localhost:3001`
2. Auto redirect → `http://localhost:3001/admin/login`
3. Nhập:
   - Email: `admin@techzone.com`
   - Password: `admin123`
4. Click "Đăng nhập"

**Expected Results:**

- ✅ Redirect → `/admin/dashboard`
- ✅ `localStorage.adminToken` có giá trị
- ✅ `localStorage.adminUser` có JSON với role="admin"
- ✅ Sidebar hiển thị với menu items

**Debug if fail:**

```javascript
// Check trong Console (F12)
console.log(localStorage.getItem("adminToken"));
console.log(localStorage.getItem("adminUser"));

// Nếu null → Check .env có JWT_SECRET chưa
// Nếu có token nhưng vẫn redirect → Token invalid
```

---

#### Test 2: Token Validation

**Steps:**

1. Đã login
2. Open DevTools → Application → Local Storage
3. Xem `adminToken` value
4. Paste token vào jwt.io để decode

**Expected Results:**

- ✅ Token decode thành công
- ✅ Payload có: `userId`, `email`, `role`
- ✅ `exp` (expiry) = 7 ngày sau
- ✅ Token không expired

---

#### Test 3: Logout

**Steps:**

1. Click nút "🚪 Đăng xuất" ở sidebar
2. Kiểm tra redirect

**Expected Results:**

- ✅ Redirect → `/admin/login`
- ✅ localStorage.adminToken = null
- ✅ localStorage.adminUser = null

---

### 📊 Dashboard Tests

#### Test 4: Dashboard Stats

**Steps:**

1. Login → `/admin/dashboard`
2. Kiểm tra 6 thẻ thống kê

**Expected Results:**

- ✅ Tổng doanh thu hiển thị số
- ✅ Tổng đơn hàng
- ✅ Tổng người dùng
- ✅ Tổng sản phẩm
- ✅ Sản phẩm sắp hết hàng
- ✅ Đơn hàng chờ xử lý

**Debug if fail:**

```javascript
// Check Network tab (F12)
// Should see 3 API calls:
GET /api/orders - Status 200
GET /api/products - Status 200
GET /api/admin/users - Status 200

// If 401 → Token issue
// If 500 → Server error, check JWT_SECRET in .env
```

---

### 📦 Product Management Tests

#### Test 5: View Products

**Steps:**

1. Click "📦 Sản phẩm" trong sidebar
2. URL: `/admin/products`

**Expected Results:**

- ✅ Table với danh sách sản phẩm
- ✅ Columns: Ảnh, Tên, Giá, Tồn kho, Actions
- ✅ Nút "Thêm sản phẩm mới"

---

#### Test 6: Add Product

**Steps:**

1. `/admin/products` → Click "Thêm sản phẩm mới"
2. Nhập thông tin:
   - Tên: "Test Product"
   - Giá: 1000000
   - Stock: 50
   - Category: "laptop"
3. Upload ảnh (optional)
4. Click "Lưu"

**Expected Results:**

- ✅ POST `/api/products` → 200
- ✅ Redirect về danh sách
- ✅ Sản phẩm mới hiển thị

---

### 📋 Order Management Tests

#### Test 7: View Orders

**Steps:**

1. Click "📋 Đơn hàng"
2. URL: `/admin/orders`

**Expected Results:**

- ✅ GET `/api/orders` → 200
- ✅ Table hiển thị tất cả đơn hàng
- ✅ Filter theo status: All, Pending, Processing, Shipped, Delivered, Cancelled

---

#### Test 8: Update Order Status

**Steps:**

1. Chọn 1 đơn hàng Pending
2. Click "Cập nhật trạng thái"
3. Chọn "Processing"
4. Confirm

**Expected Results:**

- ✅ PUT `/api/orders/{id}` → 200
- ✅ Status badge cập nhật
- ✅ Thông báo thành công

---

### 👥 User Management Tests

#### Test 9: View Users

**Steps:**

1. Click "👥 Người dùng"
2. URL: `/admin/users`

**Expected Results:**

- ✅ GET `/api/admin/users` → 200
- ✅ Table với: Name, Email, Role, Actions
- ✅ Có thể edit role

---

### 📈 Analytics Tests

#### Test 10: Analytics Dashboard

**Steps:**

1. Click "📈 Analytics"
2. URL: `/admin/analytics`

**Expected Results:**

- ✅ GET `/api/analytics/overview?days=7` → 200
- ✅ GET `/api/analytics/timeline?days=7` → 200
- ✅ GET `/api/analytics/funnel?days=7` → 200
- ✅ **Area Chart** (dạng cổ phiếu) hiển thị với 4 lines:
  - Views (blue)
  - Searches (orange)
  - Carts (green)
  - Orders (red)
- ✅ Gradient fill under lines
- ✅ Tooltip xuất hiện khi hover
- ✅ 5 thẻ tổng kết phía trên biểu đồ
- ✅ 6 thẻ thống kê: Total Events, Unique Users, etc.

---

#### Test 11: Event Explorer

**Steps:**

1. `/admin/analytics` → Click "Events" card
2. URL: `/admin/analytics/events`

**Expected Results:**

- ✅ GET `/api/analytics/events` → 200
- ✅ 4 thẻ stats: Total Events, Unique Sessions, Unique Users, Event Types
- ✅ **Bar Chart**: Phân bố loại sự kiện (top 10)
- ✅ **Pie Chart**: Phân loại hành vi (5 màu)
- ✅ Table với danh sách events
- ✅ Filter hoạt động

---

#### Test 12: Conversion Funnel

**Steps:**

1. `/admin/analytics` → Click "Funnel" card
2. URL: `/admin/analytics/funnel`

**Expected Results:**

- ✅ GET `/api/analytics/funnel?days=7` → 200
- ✅ Funnel chart với 3 stages:
  - Product Views (100%)
  - Add to Cart (X%)
  - Orders (Y%)
- ✅ Conversion rate hiển thị

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: Admin Login Redirect Loop

**Symptoms:**

- Login thành công nhưng redirect về login

**Causes:**

1. Token không được lưu
2. Token invalid
3. JWT_SECRET sai

**Fix:**

```bash
1. Check .env có JWT_SECRET chưa
2. Restart server: npm run dev:admin
3. Clear localStorage: localStorage.clear()
4. Login lại
```

---

### Issue 2: API Returns 401 Unauthorized

**Symptoms:**

- GET `/api/orders` → 401
- GET `/api/admin/users` → 401

**Causes:**

1. JWT_SECRET thiếu trong .env
2. Token hết hạn
3. Token không được gửi trong header

**Fix:**

```bash
# 1. Check .env
cat .env | findstr JWT_SECRET

# 2. Nếu thiếu, thêm vào:
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2025

# 3. Restart server
# 4. Logout và login lại
```

---

### Issue 3: API Returns 500 Internal Server Error

**Symptoms:**

- GET `/api/admin/users` → 500

**Causes:**

1. MongoDB connection failed
2. JWT verify failed (JWT_SECRET sai)
3. Database query error

**Fix:**

```bash
# 1. Check MongoDB URI
echo %MONGODB_URI%

# 2. Check server logs
# Look for error messages

# 3. Verify JWT_SECRET matches between .env và code
```

---

### Issue 4: 404 Not Found on Admin Pages

**Symptoms:**

- `/admin` → 404
- `/admin/dashboard` → OK

**Causes:**

1. File `/admin/page.tsx` đã redirect
2. Build cache cũ

**Fix:**

```bash
# 1. Clear build cache
rmdir /s /q .next

# 2. Restart server
npm run dev:admin

# 3. Access /admin → should redirect to /admin/dashboard
```

---

### Issue 5: Charts Not Displaying

**Symptoms:**

- Analytics dashboard trống
- No data message

**Causes:**

1. Không có data trong database
2. API return empty array
3. Date filter sai

**Fix:**

```bash
# 1. Generate test data
node generate-test-analytics.js

# 2. Change time range
# Select "30 ngày qua" thay vì "7 ngày qua"

# 3. Check API response
# DevTools → Network → /api/analytics/timeline
# Should return array with data
```

---

## 🎯 ACCEPTANCE CRITERIA

### ✅ System is Ready When:

**Authentication:**

- [x] Admin có thể login
- [x] Token được lưu và valid 7 ngày
- [x] Logout hoạt động đúng
- [x] Redirect logic đúng

**Dashboard:**

- [x] 6 thẻ stats hiển thị số liệu
- [x] Quick action buttons hoạt động
- [x] Sidebar navigation đúng

**Product Management:**

- [x] View products list
- [x] Add new product
- [x] Edit product
- [x] Delete product (with confirmation)

**Order Management:**

- [x] View all orders
- [x] Filter by status
- [x] Update order status
- [x] View order details

**User Management:**

- [x] View all users
- [x] Edit user role
- [x] Search users

**Analytics:**

- [x] Area chart hiển thị dạng cổ phiếu
- [x] Gradient fill colors
- [x] Tooltip interactive
- [x] 5 summary cards
- [x] Bar charts và Pie charts
- [x] Event explorer với filters
- [x] Funnel analysis

**API:**

- [x] All endpoints return correct status
- [x] Authentication works
- [x] Error handling proper
- [x] Response time < 500ms

---

## 📊 PERFORMANCE METRICS

### Target Metrics:

- **API Response Time:** < 500ms
- **Page Load Time:** < 3s
- **Time to Interactive:** < 5s
- **First Contentful Paint:** < 1.5s

### Test Tools:

```bash
# Lighthouse
npm install -g lighthouse
lighthouse http://localhost:3001 --view

# Load test
npm install -g artillery
artillery quick --count 10 --num 50 http://localhost:3001/api/orders
```

---

## 🔒 SECURITY CHECKLIST

- [x] JWT_SECRET trong .env (không hardcode)
- [x] Password hashing với bcrypt
- [x] Token expiry (admin: 7 days)
- [x] Role-based access control
- [ ] Rate limiting (TODO)
- [ ] CSRF protection (TODO)
- [ ] Input validation (TODO)
- [ ] XSS protection (TODO)

---

## 📝 TEST DATA

### Admin Account:

```
Email: admin@techzone.com
Password: admin123
Role: admin
```

### Test User:

```
Email: user@test.com
Password: user123
Role: customer
```

### Test Seller:

```
Email: seller@test.com
Password: seller123
Role: seller
```

---

## 🚨 ROLLBACK PLAN

### If Issues After Deployment:

1. **Revert .env changes:**

```bash
# Restore backup
copy .env.backup .env
```

2. **Restore old admin page:**

```bash
copy src\app\admin\page.tsx.backup src\app\admin\page.tsx
```

3. **Clear cache and restart:**

```bash
rmdir /s /q .next
npm run dev:admin
```

---

**Last Updated:** 2025-12-13  
**Status:** Ready for testing with JWT_SECRET fix
