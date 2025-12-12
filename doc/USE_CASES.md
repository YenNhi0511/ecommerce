# 📋 DANH SÁCH USE CASE - HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ

## 🎭 ACTORS (Tác nhân)

1. **Guest (Khách)** - Người dùng chưa đăng nhập
2. **Customer (Khách hàng)** - Người dùng đã đăng ký, đã đăng nhập
3. **Seller (Người bán)** - Người bán hàng trên hệ thống
4. **Admin (Quản trị viên)** - Quản lý toàn bộ hệ thống
5. **System (Hệ thống)** - Hệ thống tự động xử lý

---

## 📦 MODULE 1: QUẢN LÝ NGƯỜI DÙNG & XÁC THỰC

### UC-01: Đăng ký tài khoản

**Actor:** Guest  
**Mô tả:** Người dùng tạo tài khoản mới  
**Precondition:** Chưa có tài khoản  
**Postcondition:** Tài khoản được tạo thành công

**Main Flow:**

1. Guest truy cập trang đăng ký
2. Guest nhập thông tin (tên, email, mật khẩu, số điện thoại)
3. System validate dữ liệu đầu vào
4. System kiểm tra email chưa tồn tại
5. System mã hóa mật khẩu (bcrypt)
6. System lưu user vào database với role="customer"
7. System gửi email xác nhận
8. Hiển thị thông báo thành công

**Alternative Flow:**

- 4a. Email đã tồn tại → Hiển thị lỗi "Email đã được sử dụng"
- 3a. Dữ liệu không hợp lệ → Hiển thị lỗi validation

---

### UC-02: Đăng nhập

**Actor:** Guest  
**Mô tả:** Người dùng đăng nhập vào hệ thống  
**Precondition:** Đã có tài khoản  
**Postcondition:** Được cấp JWT token, chuyển hướng theo role

**Main Flow:**

1. Guest truy cập trang đăng nhập
2. Guest nhập email và mật khẩu
3. System validate dữ liệu
4. System tìm user theo email
5. System verify mật khẩu bằng bcrypt
6. System tạo JWT token (admin: 7 ngày, user: 15 phút)
7. System tạo refresh token
8. System trả về token và thông tin user
9. Lưu token vào localStorage (admin) hoặc cookie (user)
10. Redirect theo role:
    - Admin → `/admin/dashboard`
    - Seller → `/seller/dashboard`
    - Customer → `/`

**Alternative Flow:**

- 4a. Email không tồn tại → Lỗi "Email hoặc mật khẩu không đúng"
- 5a. Mật khẩu sai → Lỗi "Email hoặc mật khẩu không đúng"
- Rate limit: 10 lần/phút/IP

---

### UC-03: Đăng xuất

**Actor:** Customer, Seller, Admin  
**Mô tả:** Người dùng đăng xuất khỏi hệ thống  
**Precondition:** Đã đăng nhập  
**Postcondition:** Token bị xóa, quay về trang login

**Main Flow:**

1. User click nút "Đăng xuất"
2. System xóa token khỏi localStorage/cookie
3. System xóa thông tin user
4. Redirect về trang login tương ứng

---

### UC-04: Quản lý người dùng (Admin)

**Actor:** Admin  
**Mô tả:** Admin xem và quản lý tất cả người dùng  
**Precondition:** Đăng nhập với role admin  
**Postcondition:** Danh sách user được hiển thị/cập nhật

**Main Flow:**

1. Admin truy cập `/admin/users`
2. System verify JWT token
3. System kiểm tra role === "admin"
4. System load danh sách users (không bao gồm password)
5. Hiển thị bảng users với các cột: Name, Email, Phone, Role, Actions
6. Admin có thể:
   - Tìm kiếm user
   - Sửa thông tin user
   - Thay đổi role (customer/seller/admin)
   - Xóa user

**Alternative Flow:**

- 3a. Không phải admin → 403 Forbidden

---

## 🛍️ MODULE 2: QUẢN LÝ SẢN PHẨM

### UC-05: Xem danh sách sản phẩm

**Actor:** Guest, Customer, Seller, Admin  
**Mô tả:** Xem tất cả sản phẩm trên hệ thống  
**Precondition:** Không  
**Postcondition:** Hiển thị grid sản phẩm

**Main Flow:**

1. User truy cập trang chủ hoặc `/danh-muc/[category]`
2. System load sản phẩm từ database
3. System lọc theo category (nếu có)
4. System track event "CATEGORY_VIEW"
5. Hiển thị grid 4 cột với: ảnh, tên, giá, nút "Xem chi tiết"
6. User click vào sản phẩm → UC-06

---

### UC-06: Xem chi tiết sản phẩm

**Actor:** Guest, Customer, Seller, Admin  
**Mô tả:** Xem thông tin chi tiết một sản phẩm  
**Precondition:** Sản phẩm tồn tại  
**Postcondition:** Hiển thị chi tiết, track event

**Main Flow:**

1. User click vào sản phẩm
2. System load thông tin sản phẩm từ `/api/products/[id]`
3. System track event "PRODUCT_VIEW_CATEGORY" với productId
4. Hiển thị:
   - Ảnh sản phẩm (carousel nếu nhiều ảnh)
   - Tên sản phẩm
   - Giá (originalPrice có gạch ngang nếu có giảm giá)
   - Mô tả chi tiết
   - Tồn kho
   - Input chọn số lượng
   - Nút "Thêm vào giỏ hàng"
5. User chọn số lượng và click → UC-09

**Alternative Flow:**

- 2a. Sản phẩm không tồn tại → 404 Not Found

---

### UC-07: Thêm sản phẩm (Admin/Seller)

**Actor:** Admin, Seller  
**Mô tả:** Thêm sản phẩm mới vào hệ thống  
**Precondition:** Đã đăng nhập với role admin hoặc seller  
**Postcondition:** Sản phẩm mới được tạo trong database

**Main Flow:**

1. Admin/Seller truy cập `/admin/products` hoặc `/seller/products`
2. Click nút "Thêm sản phẩm mới"
3. Hiển thị form với các trường:
   - Tên sản phẩm \*
   - Mô tả \*
   - Giá gốc (originalPrice) \*
   - Giá bán (price) \*
   - Danh mục (category) \*
   - Tồn kho (stock) \*
   - Upload ảnh (1-5 ảnh)
   - Thương hiệu (brand)
4. Nhập thông tin và upload ảnh
5. System validate dữ liệu
6. System upload ảnh lên Cloudinary
7. System lưu sản phẩm vào database với:
   - createdBy = userId (nếu seller)
   - images = array URL từ Cloudinary
8. Hiển thị thông báo thành công
9. Redirect về danh sách sản phẩm

**Alternative Flow:**

- 5a. Validation fail → Hiển thị lỗi
- 6a. Upload ảnh thất bại → Hiển thị lỗi

---

### UC-08: Sửa/Xóa sản phẩm (Admin/Seller)

**Actor:** Admin, Seller  
**Mô tả:** Cập nhật hoặc xóa sản phẩm  
**Precondition:** Đã đăng nhập, sản phẩm tồn tại  
**Postcondition:** Sản phẩm được cập nhật/xóa

**Main Flow - Sửa:**

1. Admin/Seller click "Sửa" trên sản phẩm
2. System kiểm tra quyền:
   - Admin: Có thể sửa tất cả
   - Seller: Chỉ sửa sản phẩm do mình tạo (createdBy = userId)
3. Hiển thị form với dữ liệu hiện tại
4. User chỉnh sửa thông tin
5. System validate và cập nhật
6. Thông báo thành công

**Main Flow - Xóa:**

1. Admin/Seller click "Xóa"
2. Hiển thị confirm dialog
3. User xác nhận
4. System kiểm tra quyền (như trên)
5. System xóa sản phẩm khỏi database
6. Thông báo thành công

**Alternative Flow:**

- 2a. Không có quyền → 403 Forbidden

---

## 🛒 MODULE 3: GIỎ HÀNG & THANH TOÁN

### UC-09: Thêm vào giỏ hàng

**Actor:** Guest, Customer  
**Mô tả:** Thêm sản phẩm vào giỏ hàng  
**Precondition:** Đang xem chi tiết sản phẩm  
**Postcondition:** Giỏ hàng được cập nhật

**Main Flow:**

1. User chọn số lượng (input number, min=1, max=stock)
2. User click "Thêm vào giỏ hàng"
3. System kiểm tra tồn kho
4. System track event "CART_ADD" với productId
5. Nếu Customer đã login:
   - Lưu vào database (Cart model)
6. Nếu Guest:
   - Lưu vào localStorage
7. Cập nhật số lượng giỏ hàng trên header
8. Hiển thị toast "Đã thêm vào giỏ hàng"

**Alternative Flow:**

- 3a. Hết hàng → Hiển thị "Sản phẩm hết hàng"
- 3b. Số lượng > stock → Hiển thị "Chỉ còn X sản phẩm"

---

### UC-10: Xem giỏ hàng

**Actor:** Guest, Customer  
**Mô tả:** Xem danh sách sản phẩm trong giỏ  
**Precondition:** Có ít nhất 1 sản phẩm trong giỏ  
**Postcondition:** Hiển thị giỏ hàng với tổng tiền

**Main Flow:**

1. User click icon giỏ hàng hoặc truy cập `/gio-hang`
2. System load giỏ hàng:
   - Customer: Từ database
   - Guest: Từ localStorage
3. Hiển thị danh sách với mỗi item:
   - Ảnh sản phẩm
   - Tên sản phẩm
   - Giá
   - Input số lượng (+ / -)
   - Nút xóa
   - Subtotal
4. Hiển thị tổng tiền
5. Nút "Thanh toán"

**User Actions:**

- Tăng/giảm số lượng → UC-11
- Xóa sản phẩm → UC-12
- Click "Thanh toán" → UC-13

---

### UC-11: Cập nhật số lượng trong giỏ

**Actor:** Guest, Customer  
**Mô tả:** Thay đổi số lượng sản phẩm trong giỏ  
**Precondition:** Sản phẩm đã có trong giỏ  
**Postcondition:** Số lượng và tổng tiền được cập nhật

**Main Flow:**

1. User click nút +/- hoặc nhập số lượng
2. System validate số lượng (min=1, max=stock)
3. System cập nhật giỏ hàng (DB hoặc localStorage)
4. System tính lại tổng tiền
5. Cập nhật UI real-time

**Alternative Flow:**

- 2a. Số lượng > stock → Giới hạn = stock
- 2b. Số lượng < 1 → Giữ = 1

---

### UC-12: Xóa sản phẩm khỏi giỏ

**Actor:** Guest, Customer  
**Mô tả:** Xóa sản phẩm khỏi giỏ hàng  
**Precondition:** Sản phẩm đã có trong giỏ  
**Postcondition:** Sản phẩm bị xóa, tổng tiền cập nhật

**Main Flow:**

1. User click nút "Xóa"
2. System track event "CART_REMOVE"
3. System xóa khỏi giỏ hàng
4. Cập nhật tổng tiền
5. Hiển thị toast "Đã xóa khỏi giỏ hàng"

---

### UC-13: Thanh toán

**Actor:** Customer  
**Mô tả:** Đặt hàng và thanh toán  
**Precondition:** Đã đăng nhập, giỏ hàng có sản phẩm  
**Postcondition:** Đơn hàng được tạo, tồn kho giảm

**Main Flow:**

1. User click "Thanh toán" từ giỏ hàng
2. Redirect đến `/thanh-toan`
3. Hiển thị form:
   - Thông tin giao hàng:
     - Họ tên
     - Số điện thoại
     - Địa chỉ
     - Thành phố
     - Quốc gia
   - Phương thức thanh toán:
     - COD (Ship COD)
     - Chuyển khoản
     - Stripe (nếu tích hợp)
   - Mã giảm giá (optional)
   - Tóm tắt đơn hàng
4. User nhập thông tin và click "Đặt hàng"
5. System validate dữ liệu
6. System kiểm tra tồn kho của tất cả sản phẩm
7. System tính toán:
   - itemsTotal (tổng tiền hàng)
   - discount (nếu có coupon hợp lệ)
   - shippingFee (phí ship)
   - totalAmount (tổng cộng)
8. System tạo Order trong database:
   - user: userId
   - items: array sản phẩm với giá snapshot
   - shippingAddress
   - paymentMethod
   - orderStatus: "pending"
   - totalAmount
9. System giảm stock của từng sản phẩm
10. System xóa giỏ hàng
11. System track event "ORDER_COMPLETE"
12. System gửi email xác nhận (nếu có nodemailer)
13. Redirect đến `/don-hang` với thông báo thành công

**Alternative Flow:**

- 6a. Sản phẩm hết hàng → Lỗi "Sản phẩm X đã hết hàng"
- 6b. Số lượng không đủ → Lỗi "Sản phẩm X chỉ còn Y"
- Coupon không hợp lệ → Không áp dụng giảm giá

---

## 📋 MODULE 4: QUẢN LÝ ĐƠN HÀNG

### UC-14: Xem đơn hàng của tôi (Customer)

**Actor:** Customer  
**Mô tả:** Customer xem lịch sử đơn hàng của mình  
**Precondition:** Đã đăng nhập  
**Postcondition:** Hiển thị danh sách đơn hàng

**Main Flow:**

1. Customer truy cập `/don-hang`
2. System load đơn hàng: `Order.find({ user: userId })`
3. Hiển thị danh sách với:
   - Mã đơn hàng
   - Ngày đặt
   - Tổng tiền
   - Trạng thái (badge màu)
   - Nút "Xem chi tiết"
4. Click "Xem chi tiết" → Hiển thị:
   - Danh sách sản phẩm
   - Thông tin giao hàng
   - Phương thức thanh toán
   - Timeline trạng thái

---

### UC-15: Quản lý đơn hàng (Admin)

**Actor:** Admin  
**Mô tả:** Admin xem và quản lý tất cả đơn hàng  
**Precondition:** Đăng nhập với role admin  
**Postcondition:** Có thể xem và cập nhật đơn hàng

**Main Flow:**

1. Admin truy cập `/admin/orders`
2. System verify token và role
3. System load tất cả đơn hàng: `Order.find().populate('user')`
4. Hiển thị bảng với filter:
   - Tất cả
   - Pending
   - Processing
   - Shipped
   - Delivered
   - Cancelled
5. Admin có thể:
   - Xem chi tiết đơn
   - Cập nhật trạng thái → UC-16
   - In hóa đơn
   - Hủy đơn

---

### UC-16: Cập nhật trạng thái đơn hàng

**Actor:** Admin, Seller  
**Mô tả:** Thay đổi trạng thái đơn hàng  
**Precondition:** Đơn hàng tồn tại, có quyền  
**Postcondition:** Trạng thái được cập nhật

**Main Flow:**

1. Admin/Seller click "Cập nhật trạng thái"
2. Hiển thị dropdown với options:
   - Pending → Processing
   - Processing → Shipped
   - Shipped → Delivered
   - Any → Cancelled
3. Admin chọn trạng thái mới
4. System cập nhật: `Order.findByIdAndUpdate()`
5. System track audit log
6. System gửi email thông báo cho khách (optional)
7. Thông báo thành công

**Business Rules:**

- Cancelled → Hoàn lại stock
- Delivered → Cập nhật doanh thu

---

### UC-17: Xem đơn hàng liên quan (Seller)

**Actor:** Seller  
**Mô tả:** Seller xem đơn chứa sản phẩm của mình  
**Precondition:** Đã đăng nhập với role seller  
**Postcondition:** Hiển thị đơn hàng liên quan

**Main Flow:**

1. Seller truy cập `/seller/orders`
2. System tìm sản phẩm của seller: `Product.find({ createdBy: sellerId })`
3. System tìm đơn có chứa các sản phẩm đó:
   ```javascript
   Order.find({ "items.product": { $in: sellerProductIds } });
   ```
4. Hiển thị danh sách đơn với thông tin:
   - Sản phẩm của seller trong đơn
   - Tổng tiền của sản phẩm seller
   - Trạng thái
5. Seller có thể cập nhật trạng thái (nếu có quyền)

---

## 🔍 MODULE 5: TÌM KIẾM

### UC-18: Tìm kiếm sản phẩm

**Actor:** Guest, Customer  
**Mô tả:** Tìm sản phẩm theo từ khóa  
**Precondition:** Không  
**Postcondition:** Hiển thị kết quả tìm kiếm

**Main Flow:**

1. User nhập từ khóa vào search box
2. User nhấn Enter hoặc click icon search
3. System track event "SEARCH_QUERY" với query text
4. System tìm sản phẩm:
   ```javascript
   Product.find({
     $or: [
       { name: { $regex: query, $options: "i" } },
       { description: { $regex: query, $options: "i" } },
       { category: { $regex: query, $options: "i" } },
     ],
   });
   ```
5. System track event "SEARCH_RESULTS_VIEW"
6. Hiển thị kết quả dạng grid
7. Hiển thị số lượng kết quả

**Alternative Flow:**

- Không có kết quả → Hiển thị "Không tìm thấy sản phẩm nào"

---

## 📊 MODULE 6: ANALYTICS

### UC-19: Xem Analytics Dashboard

**Actor:** Admin  
**Mô tả:** Xem tổng quan analytics  
**Precondition:** Đã đăng nhập với role admin  
**Postcondition:** Hiển thị dashboard với biểu đồ

**Main Flow:**

1. Admin truy cập `/admin/analytics`
2. System load dữ liệu từ 3 APIs:
   - `/api/analytics/overview?days=7`
   - `/api/analytics/funnel?days=7`
   - `/api/analytics/timeline?days=7`
3. Hiển thị:
   - **Biểu đồ Area Chart** (dạng cổ phiếu):
     - Views, Searches, Carts, Orders theo ngày
     - Gradient fill màu
     - Tooltip chuyên nghiệp
   - **5 thẻ tổng kết** (trên biểu đồ)
   - **6 thẻ thống kê**: Total Events, Unique Users, Product Views, Add to Cart, Orders, Conversion Rate
   - **Conversion Funnel**: Views → Carts → Orders với tỷ lệ %
   - **Top 10 sản phẩm** (Bar Chart ngang)
   - **Top 10 từ khóa** (Pie Chart)
   - **Phân bố sự kiện** (Bar Chart)
4. Admin có thể:
   - Chọn time range: 24h, 7 ngày, 30 ngày, 90 ngày
   - Click vào feature card: Events, Journey, Funnel

---

### UC-20: Xem Event Explorer

**Actor:** Admin  
**Mô tả:** Xem chi tiết từng event được track  
**Precondition:** Đã đăng nhập với role admin  
**Postcondition:** Hiển thị danh sách events

**Main Flow:**

1. Admin truy cập `/admin/analytics/events`
2. Hiển thị bộ lọc:
   - Loại sự kiện (dropdown)
   - Từ ngày - Đến ngày (date picker)
   - Session ID (input)
3. System load events với filter từ `/api/analytics/events?...`
4. Hiển thị:
   - **4 thẻ thống kê**: Tổng Events, Unique Sessions, Unique Users, Event Types
   - **Bar Chart**: Phân bố loại sự kiện (top 10)
   - **Pie Chart**: Phân loại hành vi (VIEW/CART/SEARCH/ORDER/OTHER)
   - **Bảng events** với cột:
     - Timestamp
     - Event Type (badge màu)
     - Session ID (truncated)
     - User ID
     - Metadata (JSON)
     - IP Address
     - User Agent
     - Actions (Xem chi tiết)
5. Admin click "Xem chi tiết" → Modal hiển thị full metadata

---

### UC-21: Track User Behavior

**Actor:** System  
**Mô tả:** Tự động track các hành vi người dùng  
**Precondition:** User thực hiện hành động  
**Postcondition:** Event được lưu vào database

**Main Flow:**

1. User thực hiện một trong các hành động:
   - Xem trang danh mục
   - Xem chi tiết sản phẩm
   - Thêm vào giỏ hàng
   - Xóa khỏi giỏ hàng
   - Tìm kiếm
   - Xem kết quả tìm kiếm
   - Hoàn thành đơn hàng
2. Frontend gọi `POST /api/analytics/track` với:
   ```javascript
   {
     event: "PRODUCT_VIEW_CATEGORY",
     metadata: { productId, category },
     userId: user?._id || null,
     sessionId: localStorage.sessionId,
     ipAddress: req.ip,
     userAgent: req.headers['user-agent']
   }
   ```
3. System validate dữ liệu
4. System lưu vào UserBehavior collection
5. Return 200 OK

**Events được track:**

- `CATEGORY_VIEW` - Xem danh mục
- `PRODUCT_VIEW_CATEGORY` - Xem sản phẩm
- `CART_ADD` - Thêm giỏ hàng
- `CART_REMOVE` - Xóa giỏ hàng
- `SEARCH_QUERY` - Nhập từ khóa tìm kiếm
- `SEARCH_RESULTS_VIEW` - Xem kết quả tìm kiếm
- `ORDER_COMPLETE` - Hoàn thành đơn hàng

---

### UC-22: Xem User Journey

**Actor:** Admin  
**Mô tả:** Xem hành trình của người dùng theo session  
**Precondition:** Đã đăng nhập với role admin  
**Postcondition:** Hiển thị timeline hành trình

**Main Flow:**

1. Admin truy cập `/admin/analytics/journey`
2. Admin nhập Session ID hoặc User ID
3. System load events theo thứ tự thời gian
4. Hiển thị timeline với:
   - Icon cho mỗi event type
   - Timestamp
   - Event name
   - Metadata
   - Duration giữa các event
5. Visualize flow: A → B → C → D

---

### UC-23: Xem Conversion Funnel

**Actor:** Admin  
**Mô tả:** Phân tích phễu chuyển đổi  
**Precondition:** Đã đăng nhập với role admin  
**Postcondition:** Hiển thị funnel chart

**Main Flow:**

1. Admin truy cập `/admin/analytics/funnel`
2. System tính toán funnel:
   - **Stage 1**: Product Views (100%)
   - **Stage 2**: Add to Cart (X% của views)
   - **Stage 3**: Orders (Y% của carts)
3. Hiển thị:
   - Horizontal funnel bars với độ rộng tỷ lệ
   - Số lượng và % mỗi stage
   - Drop-off rate giữa các stage
   - Conversion rate cuối cùng
4. Admin có thể:
   - Chọn time range
   - Tạo custom funnel với các event khác

---

## 🎯 BUSINESS RULES

### Giá cả:

- `originalPrice >= price` (giá gốc phải >= giá bán)
- Hiển thị discount % nếu originalPrice > price
- Giá trong Order lưu snapshot tại thời điểm đặt hàng

### Tồn kho:

- Không được đặt hàng với số lượng > stock
- Stock giảm ngay khi đơn hàng được tạo
- Stock được hoàn lại nếu đơn bị cancelled

### Mã giảm giá:

- Kiểm tra: valid date, usage limit, min order value
- Discount type: percentage hoặc fixed amount
- Một đơn hàng chỉ dùng 1 coupon

### Phí ship:

- Miễn phí nếu đơn hàng > threshold (ví dụ: 500k)
- Tính theo khu vực (nếu có)

### Session:

- Tạo sessionId khi lần đầu vào site, lưu localStorage
- Session hết hạn sau 30 phút không hoạt động
- Mỗi session có thể có nhiều events

### Authentication:

- JWT token: Admin (7 ngày), User (15 phút)
- Refresh token: 30 ngày
- Rate limit: 10 login attempts/minute/IP

---

## 📈 NON-FUNCTIONAL REQUIREMENTS

### Performance:

- API response time < 500ms
- Page load time < 3s
- Support 1000 concurrent users

### Security:

- Password: bcrypt với salt rounds = 10
- JWT với secret key
- XSS protection
- CSRF protection
- Rate limiting

### Scalability:

- MongoDB với indexing
- Cloudinary cho ảnh
- Redis cache (optional)

### Monitoring:

- Track tất cả user actions
- Error logging
- Audit trail cho admin actions

---

## 📊 BẢNG TÓM TẮT USE CASES

| ID    | Tên Use Case                 | Actor                   | Module          |
| ----- | ---------------------------- | ----------------------- | --------------- |
| UC-01 | Đăng ký tài khoản            | Guest                   | Authentication  |
| UC-02 | Đăng nhập                    | Guest                   | Authentication  |
| UC-03 | Đăng xuất                    | Customer, Seller, Admin | Authentication  |
| UC-04 | Quản lý người dùng           | Admin                   | User Management |
| UC-05 | Xem danh sách sản phẩm       | All                     | Product         |
| UC-06 | Xem chi tiết sản phẩm        | All                     | Product         |
| UC-07 | Thêm sản phẩm                | Admin, Seller           | Product         |
| UC-08 | Sửa/Xóa sản phẩm             | Admin, Seller           | Product         |
| UC-09 | Thêm vào giỏ hàng            | Guest, Customer         | Cart            |
| UC-10 | Xem giỏ hàng                 | Guest, Customer         | Cart            |
| UC-11 | Cập nhật số lượng trong giỏ  | Guest, Customer         | Cart            |
| UC-12 | Xóa sản phẩm khỏi giỏ        | Guest, Customer         | Cart            |
| UC-13 | Thanh toán                   | Customer                | Checkout        |
| UC-14 | Xem đơn hàng của tôi         | Customer                | Order           |
| UC-15 | Quản lý đơn hàng             | Admin                   | Order           |
| UC-16 | Cập nhật trạng thái đơn hàng | Admin, Seller           | Order           |
| UC-17 | Xem đơn hàng liên quan       | Seller                  | Order           |
| UC-18 | Tìm kiếm sản phẩm            | Guest, Customer         | Search          |
| UC-19 | Xem Analytics Dashboard      | Admin                   | Analytics       |
| UC-20 | Xem Event Explorer           | Admin                   | Analytics       |
| UC-21 | Track User Behavior          | System                  | Analytics       |
| UC-22 | Xem User Journey             | Admin                   | Analytics       |
| UC-23 | Xem Conversion Funnel        | Admin                   | Analytics       |

---

## 🔗 USE CASE RELATIONSHIPS

### Include Relationships:

- UC-13 (Thanh toán) includes UC-21 (Track Behavior)
- UC-06 (Chi tiết sản phẩm) includes UC-21 (Track Behavior)
- UC-09 (Thêm giỏ hàng) includes UC-21 (Track Behavior)

### Extend Relationships:

- UC-13 (Thanh toán) extends với áp dụng coupon
- UC-07 (Thêm sản phẩm) extends với upload nhiều ảnh
- UC-19 (Analytics Dashboard) extends với custom date range

### Generalization:

- UC-15 (Quản lý đơn hàng - Admin) generalizes UC-17 (Xem đơn hàng - Seller)
- UC-08 (Sửa sản phẩm) generalizes cho Admin và Seller với quyền khác nhau
