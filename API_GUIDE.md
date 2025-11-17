# API Hướng dẫn cập nhật giá và hình ảnh sản phẩm

## 🚀 Tổng quan

Website đã được trang bị các API để cập nhật giá và hình ảnh sản phẩm một cách dễ dàng.

## 📋 API Endpoints

### 1. Cập nhật giá sản phẩm đơn lẻ

```
PUT /api/products/{id}
```

**Body:**

```json
{
  "price": 5000000,
  "originalPrice": 6000000
}
```

**Ví dụ:**

```bash
curl -X PUT http://localhost:3001/api/products/673abc123def456 \
  -H "Content-Type: application/json" \
  -d '{"price": 5000000, "originalPrice": 6000000}'
```

### 2. Cập nhật giá hàng loạt theo danh mục

```
PUT /api/products/bulk-update
```

**Body:**

```json
{
  "category": "Điện thoại",
  "priceMultiplier": 1.1
}
```

**Ví dụ - Tăng giá điện thoại 10%:**

```bash
curl -X PUT http://localhost:3001/api/products/bulk-update \
  -H "Content-Type: application/json" \
  -d '{"category": "Điện thoại", "priceMultiplier": 1.1}'
```

### 3. Cập nhật hình ảnh sản phẩm

```
PUT /api/products/update-images
```

**Body - Cập nhật theo danh mục:**

```json
{
  "category": "Điện thoại"
}
```

**Body - Cập nhật tất cả:**

```json
{
  "updateAll": true
}
```

**Ví dụ - Cập nhật hình ảnh điện thoại:**

```bash
curl -X PUT http://localhost:3001/api/products/update-images \
  -H "Content-Type: application/json" \
  -d '{"category": "Điện thoại"}'
```

## 🛠️ Sử dụng Script Test

### Chạy script Node.js:

```bash
cd d:\TMĐT\Do_An_TMDT\ecommerce
node scripts/update-products.js
```

### Script sẽ thực hiện:

1. ✅ Tăng giá điện thoại 10%
2. ✅ Tăng giá laptop 5%
3. ✅ Giảm giá phụ kiện 5%
4. ✅ Cập nhật hình ảnh chất lượng cao cho tất cả sản phẩm

## 📊 Ví dụ sử dụng thực tế

### Tăng giá tất cả sản phẩm 15%:

```bash
curl -X PUT http://localhost:3001/api/products/bulk-update \
  -H "Content-Type: application/json" \
  -d '{"priceMultiplier": 1.15}'
```

### Giảm giá laptop 20%:

```bash
curl -X PUT http://localhost:3001/api/products/bulk-update \
  -H "Content-Type: application/json" \
  -d '{"category": "Laptop", "priceMultiplier": 0.8}'
```

### Cập nhật hình ảnh tất cả sản phẩm:

```bash
curl -X PUT http://localhost:3001/api/products/update-images \
  -H "Content-Type: application/json" \
  -d '{"updateAll": true}'
```

## 🎯 Lưu ý

- **Backup database** trước khi chạy script
- Giá sản phẩm phải là số dương
- Hình ảnh được lấy từ Unsplash với chất lượng cao (800x800px)
- Script sẽ cập nhật `updatedAt` timestamp tự động

## 🔍 Kiểm tra kết quả

Sau khi cập nhật, kiểm tra:

- Website: http://localhost:3001
- Database: MongoDB Atlas hoặc MongoDB Compass
- API response để xem số lượng sản phẩm đã cập nhật
