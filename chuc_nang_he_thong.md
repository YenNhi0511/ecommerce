
# Chức năng hệ thống – Phiên bản Markdown

## 1. Các chức năng người dùng (User Features)

### 1.1. Đăng ký / Đăng nhập / Tài khoản
- **1.1. Đăng ký** *(Đã có, kiểm tra > 6 ký tự)*
- **1.2. Đăng nhập** *(Đã có)*
- **1.3. Đổi mật khẩu** *(Chưa có)*
- **1.4. Đăng xuất** *(Đã có)*

## 2. Giao diện người dùng (UI/UX)

### 2.1. Banner khuyến mãi
- Có giao diện nhưng **chưa xử lý logic**.

### 2.2. Danh mục sản phẩm
- **2.2.1. Xem sản phẩm nổi bật** *(Đã có)*
- **2.2.2. Bộ lọc** *(Mới nhất, Giá cao nhất, Giá thấp nhất)*

### 2.3. Sản phẩm yêu thích
- **2.3.1. Giá + đánh giá**  
  - *Hiện đang trừ khuyến mãi dù chưa áp dụng → cần chỉnh sửa.*
- **2.3.2. Xem chi tiết sản phẩm** *(Đã có)*

### 2.4. Xem tất cả sản phẩm
- **2.4.1. Tên sản phẩm** *(Đã có)*
- **2.4.2. Đánh giá sản phẩm** *(Cần xem lại – không rõ tổng đánh giá lấy từ đâu)*
- **2.4.3. Giá sản phẩm** *(Cần xem lại)*
- **2.4.4. Mô tả sản phẩm** *(Đã có)*
- **2.4.5. Tính năng nổi bật** *(Đã có)*
- **2.4.6. Thêm giỏ hàng** *(Đã có)*
- **2.4.7. Mua ngay** *(Đã có)*
- **2.4.8. Thông số kỹ thuật + thông tin** *(Đã có)*
- **2.4.9. Đánh giá sản phẩm**  
  - Bình luận hoạt động  
  - Chọn số sao được nhưng *UI không thay đổi ngay → dễ gây nhầm lẫn*
- **2.4.10. Xem tất cả bình luận** *(Đã có)*
- **2.4.11. Sản phẩm liên quan** *(Đã có)*

## 2.5. Giỏ hàng
- **2.5.1. Thêm/xóa sản phẩm** *(Đã có)*
- **2.5.2. Tính tổng giá, tự động cập nhật** *(Đã có)*
- **2.5.3. Tiếp tục mua sắm** *(Đã có)*
- **2.5.4. Thanh toán** *(Đã có)*

## 2.6. Thanh toán (Checkout)
Tài liệu tham khảo: https://github.com/momo-wallet/payment/

### 2.6.1. Điền thông tin giao hàng *(Đã có)*
### 2.6.2. Phương thức thanh toán
- Khi nhận hàng (COD)
- Thẻ ATM

### 2.6.3. Đặt hàng
- *Cần thêm*: Nhập mã giảm giá, tính lại tiền, tích hợp thanh toán MoMo.

#### 2.6.3.1. Trường hợp COD
- Đơn hàng → **Chờ duyệt**
- Người bán duyệt → **Đã đặt hàng**

#### 2.6.3.2. Trường hợp ATM
- **Thanh toán không hoàn tất**: Đơn → *Chờ thanh toán*, người bán có thể duyệt/hủy
- **Thanh toán thành công**: Đơn hàng tự động chuyển sang **Đã duyệt**

## 2.7. Liên hệ
- **2.7.1. Form liên hệ** *(Đã có)*
- **2.7.2. Gửi tin nhắn** *(Có thể cần API Google để admin nhận tin)*

## 2.7. Khuyến mãi *(Chưa có implement)*
- **2.7.1. Tên khuyến mãi**
- **2.7.2. Mô tả**
- **2.7.3. Mã giảm giá**
- **2.7.4. Thời gian áp dụng**

## 2.8. Chatbox *(Chưa có)*
- **2.8.1. Tawk.io** (Cần nghiên cứu thêm)

## 2.9. Đa ngôn ngữ *(Chưa có)*
- **2.9.1. Việt – Anh**
- **2.9.2. Chuyển EN ⇄ VN**

# 3. Trang quản lý của người bán (Seller Dashboard)

## 3.1. Quản lý sản phẩm *(Chưa có)*
- **3.1.1. CRUD sản phẩm**

## 3.2. Quản lý đơn hàng *(Chưa có)*
- **3.2.1. Duyệt / Hủy đơn hàng**
- **3.2.2. Xem lịch sử đơn theo ngày hoặc theo thời gian**

## 3.3. Quản lý khuyến mãi *(Chưa rõ đã có chưa)*
- **3.3.1. CRUD khuyến mãi**

## 3.4. Quản lý bình luận *(Không rõ đã có chưa)*
- **3.4.1. CRUD bình luận**

# 4. Trang quản trị viên (Admin Panel) *(Chưa có)*
## 4.1. Quản lý tài khoản
## 4.2. Lịch sử đăng nhập tài khoản
