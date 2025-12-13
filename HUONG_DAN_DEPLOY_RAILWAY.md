# 🚀 HƯỚNG DẪN DEPLOY APP LÊN RAILWAY

**App E-commerce Next.js - Deploy đơn giản chỉ 1 service**

---

## 📋 CHUẨN BỊ

### Yêu cầu:
- ✅ Tài khoản [Railway](https://railway.app) (đăng ký bằng GitHub - miễn phí)
- ✅ MongoDB Atlas account (hoặc dùng Railway MongoDB addon)
- ✅ Code đã push lên GitHub repository

### Các file config đã sẵn sàng:
- ✅ `railway.json` - Cấu hình Railway
- ✅ `next.config.mjs` - Next.js standalone build
- ✅ `.env.example` - Template biến môi trường
- ✅ `src/app/api/health/route.ts` - Health check endpoint
- ✅ `src/lib/mongodb.ts` - Kết nối MongoDB (yêu cầu env var)

---

## 🎯 BƯỚC 1: CHUẨN BỊ MONGODB

### Option A: Dùng MongoDB Atlas (Khuyên dùng - Free 512MB)

1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo tài khoản và cluster mới (chọn FREE tier)
3. Vào **Database Access** → Add New Database User:
   - Username: `ecommerce_user`
   - Password: (tạo mật khẩu mạnh, lưu lại)
4. Vào **Network Access** → Add IP Address:
   - Chọn **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   - Điều này cần thiết cho Railway
5. Vào **Database** → Click **Connect**:
   - Chọn **"Connect your application"**
   - Copy connection string, ví dụ:
   ```
   mongodb+srv://ecommerce_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Thay `<password>` bằng mật khẩu thực tế
   - Thêm tên database, ví dụ: `/ecommerce` trước `?`:
   ```
   mongodb+srv://ecommerce_user:MatKhau123@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```

### Option B: Dùng Railway MongoDB (Đơn giản hơn)

*Sẽ làm ở bước 4 sau khi tạo project Railway*

---

## 🚂 BƯỚC 2: TẠO PROJECT RAILWAY

1. Truy cập [railway.app](https://railway.app)
2. Click **"New Project"**
3. Chọn **"Deploy from GitHub repo"**
4. Authorize Railway truy cập GitHub của bạn
5. Chọn repository: **`ecommerce`**
6. Railway sẽ tự động:
   - Detect Next.js project
   - Chạy `npm install`
   - Chạy `npm run build`
   - Deploy app

⏳ *Chờ 5-10 phút để build lần đầu...*

---

## ⚙️ BƯỚC 3: CẤU HÌNH BIẾN MÔI TRƯỜNG

### 3.1. Mở Settings

1. Trong Railway project, click vào service (hình màu tím/xanh)
2. Chọn tab **"Variables"**

### 3.2. Thêm các biến BẮT BUỘC

Click **"New Variable"** và thêm từng cái sau:

#### 🔴 Biến bắt buộc (Không có sẽ lỗi):

```bash
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT Security
JWT_SECRET=chuoi-bi-mat-rat-dai-va-ngau-nhien-123456789

# Node Environment
NODE_ENV=production
```

**Lưu ý:**
- `MONGODB_URI`: Dán connection string MongoDB từ Bước 1
- `JWT_SECRET`: Tạo chuỗi ngẫu nhiên dài (ít nhất 32 ký tự), ví dụ:
  ```
  8f7e6d5c4b3a2918f7e6d5c4b3a2918f7e6d5c4b3a291
  ```

### 3.3. Thêm biến TÙY CHỌN (nếu dùng các tính năng này):

#### Stripe Payment (Thanh toán thẻ):
```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
STRIPE_CURRENCY=vnd
```

#### Cloudinary (Upload ảnh):
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

#### Gmail (Gửi email liên hệ):
```bash
GMAIL_USER=youremail@gmail.com
GMAIL_PASS=your-app-password
```
*Lưu ý: GMAIL_PASS là App Password, không phải mật khẩu Gmail thường*

#### MoMo Payment (Thanh toán MoMo sandbox):
```bash
MOMO_PARTNER_CODE=MOMOXXX
MOMO_ACCESS_KEY=xxxxxxxxxxxx
MOMO_SECRET_KEY=xxxxxxxxxxxx
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
```

---

## 🌐 BƯỚC 4: LẤY DOMAIN VÀ CẬP NHẬT

### 4.1. Generate Domain

1. Vào tab **"Settings"** của service
2. Scroll xuống phần **"Networking"** hoặc **"Domains"**
3. Click **"Generate Domain"**
4. Railway sẽ tạo URL dạng:
   ```
   https://ecommerce-production-xxxx.up.railway.app
   ```
5. **Copy URL này**

### 4.2. Thêm URL vào biến môi trường

1. Quay lại tab **"Variables"**
2. Thêm biến mới:
   ```bash
   NEXT_PUBLIC_BASE_URL=https://ecommerce-production-xxxx.up.railway.app
   ```
   *(Dán URL vừa copy)*

3. Click **"Add"** để lưu

### 4.3. Redeploy

Railway sẽ tự động deploy lại khi thêm biến mới. Nếu không:
1. Vào tab **"Deployments"**
2. Click dấu **"..."** ở deployment mới nhất
3. Chọn **"Redeploy"**

---

## ✅ BƯỚC 5: KIỂM TRA APP

### 5.1. Kiểm tra Health Check

Mở trình duyệt, truy cập:
```
https://your-app.railway.app/api/health
```

Nếu thấy:
```json
{"ok":true,"ts":1702468901234}
```
→ **App đang chạy tốt! ✅**

### 5.2. Kiểm tra Trang chủ

Truy cập:
```
https://your-app.railway.app
```

Bạn sẽ thấy trang chủ e-commerce.

### 5.3. Kiểm tra MongoDB

1. Mở trang chủ, scroll xuống → nên thấy danh sách sản phẩm
2. Nếu không có sản phẩm, truy cập:
   ```
   https://your-app.railway.app/seed
   ```
   Click **"Generate Seed Data"** để tạo dữ liệu mẫu

### 5.4. Test Đăng ký / Đăng nhập

1. Truy cập: `https://your-app.railway.app/dang-ky`
2. Đăng ký tài khoản mới
3. Đăng nhập
4. Thử thêm sản phẩm vào giỏ hàng

---

## 🔧 KHẮC PHỤC LỖI THƯỜNG GẶP

### ❌ Lỗi: "Application Error" hoặc 500

**Nguyên nhân:** Thiếu biến môi trường hoặc MongoDB không kết nối được

**Cách sửa:**
1. Vào tab **"Deployments"** → Click vào deployment mới nhất
2. Xem **"View Logs"**
3. Tìm lỗi trong logs:
   - `Missing MONGODB_URI` → Chưa set biến MONGODB_URI
   - `MongoNetworkError` → MongoDB Atlas chưa whitelist IP `0.0.0.0/0`
   - `Authentication failed` → Sai username/password MongoDB

### ❌ Lỗi: Build Failed

**Nguyên nhân:** Code có lỗi TypeScript hoặc dependency thiếu

**Cách sửa:**
1. Kiểm tra build logs trong Railway
2. Chạy local: `npm run build` để test
3. Fix lỗi, push code lên GitHub
4. Railway tự động build lại

### ❌ Lỗi: MongoDB connection timeout

**Cách sửa:**
1. Vào MongoDB Atlas
2. **Network Access** → Đảm bảo có `0.0.0.0/0` (Allow from anywhere)
3. Đợi 2-3 phút để thay đổi có hiệu lực
4. Redeploy Railway

### ❌ Lỗi: "Stripe not configured"

**Không phải lỗi nếu:**
- Bạn chưa muốn dùng thanh toán Stripe
- Chỉ cần set `STRIPE_SECRET_KEY` nếu muốn dùng

### ❌ Lỗi: Railpack "Connection reset by peer" hoặc "error decoding response body"

**Nguyên nhân:** Lỗi network tạm thời khi Railpack download Node.js

**Cách sửa:**
1. **Retry Deploy** - Click nút **"Redeploy"** trong Railway (lỗi network thường tự hết)
2. **Đợi 5-10 phút** rồi thử lại
3. **Kiểm tra Railway Status:** [status.railway.app](https://status.railway.app) - có thể Railway đang maintenance
4. Nếu vẫn lỗi sau 3 lần, thử:
   - Vào **Settings** → **Service Settings**
   - Tìm "Builder" hoặc refresh trang Railway
   - Click **"Redeploy"** lại

**Lưu ý:** Railpack mới và đang beta, lỗi network này thường tự hết sau vài lần retry.

---

## 📊 XEM LOGS VÀ MONITOR

### Xem Logs realtime:

1. Vào tab **"Deployments"**
2. Click vào deployment đang chạy
3. Logs sẽ hiện ra tự động

### Theo dõi resource usage:

1. Vào tab **"Metrics"**
2. Xem CPU, Memory, Network usage

### Railway Free Tier giới hạn:

- **$5 credit** mỗi tháng (tương đương ~500 giờ chạy)
- Nếu hết credit, app sẽ tạm dừng đến tháng sau

---

## 🎨 TÙY CHỈNH DOMAIN RIÊNG (Optional)

### Bước 1: Lấy CNAME từ Railway

1. Vào Railway Dashboard → Click vào service của bạn
2. Vào tab **"Settings"**
3. Scroll xuống phần **"Domains"** hoặc **"Networking"**
4. Click **"Custom Domain"**
5. Nhập domain của bạn, ví dụ:
   - `shop.example.com` (subdomain - khuyên dùng)
   - `example.com` (root domain)
6. Railway sẽ hiển thị CNAME record cần thêm, ví dụ:
   ```
   CNAME: shop
   Value: ecommerce-production-xxxx.up.railway.app
   ```
7. **Copy giá trị CNAME này** (giữ tab Railway mở)

### Bước 2: Cấu hình DNS trên Name.com

#### Option A: Dùng Subdomain (Khuyên dùng - VD: shop.example.com)

1. Đăng nhập [Name.com](https://www.name.com/)
2. Vào **"My Account"** → **"Manage Domains"**
3. Click vào domain của bạn (ví dụ: `example.com`)
4. Vào tab **"DNS Records"**
5. Click **"Add Record"**
6. Thêm CNAME record:
   ```
   Type: CNAME
   Host: shop (hoặc tên subdomain bạn muốn)
   Answer: ecommerce-production-xxxx.up.railway.app
   TTL: 300 (5 phút) hoặc 3600 (1 giờ)
   ```
7. Click **"Add Record"** để lưu

#### Option B: Dùng Root Domain (VD: example.com)

**Lưu ý:** Name.com hỗ trợ ANAME/ALIAS cho root domain

1. Đăng nhập [Name.com](https://www.name.com/)
2. Vào **"My Account"** → **"Manage Domains"**
3. Click vào domain của bạn
4. Vào tab **"DNS Records"**
5. **Xóa** các A record cũ của @ (root)
6. Click **"Add Record"**
7. Thêm ANAME record:
   ```
   Type: ANAME (hoặc ALIAS nếu có)
   Host: @ (root domain)
   Answer: ecommerce-production-xxxx.up.railway.app
   TTL: 300
   ```
8. Click **"Add Record"** để lưu

**Nếu Name.com không có ANAME/ALIAS:**
- Railway sẽ cung cấp IP addresses
- Thêm A records với những IP đó thay vì CNAME

### Bước 3: Verify Domain trên Railway

1. Quay lại Railway Dashboard
2. Vào tab **"Settings"** → **"Domains"**
3. Railway sẽ tự động kiểm tra DNS
4. Khi thấy **"Active"** màu xanh → Thành công! ✅

### Bước 4: Cập nhật Environment Variables

1. Vào tab **"Variables"** trong Railway
2. Cập nhật biến:
   ```bash
   NEXT_PUBLIC_BASE_URL=https://shop.example.com
   NEXT_PUBLIC_SITE_URL=https://shop.example.com
   ```
3. Railway sẽ tự động redeploy

### Bước 5: Test Domain

1. Đợi **5-30 phút** để DNS propagate (thường chỉ 5-10 phút)
2. Kiểm tra DNS đã cập nhật chưa:
   ```bash
   nslookup shop.example.com
   ```
3. Truy cập domain của bạn:
   ```
   https://shop.example.com
   ```
4. Kiểm tra SSL certificate (Railway tự động cấp Let's Encrypt)

### ⚠️ Lưu ý quan trọng:

1. **SSL Certificate:** Railway tự động cấp SSL miễn phí từ Let's Encrypt sau khi DNS verified
2. **TTL:** Set TTL thấp (300s) khi setup lần đầu để dễ sửa nếu sai
3. **WWW Redirect:** Nếu muốn `www.example.com` redirect về `example.com`:
   - Thêm CNAME: `www` → `example.com`
   - Hoặc setup redirect trong Railway Settings
4. **Propagation Time:** 
   - Name.com: Thường 5-15 phút
   - Toàn cầu: Có thể đến 24-48 giờ
   - Kiểm tra: [whatsmydns.net](https://www.whatsmydns.net/)

### 🔧 Troubleshooting

**❌ Domain không load:**
- Kiểm tra CNAME record đã đúng chưa trên Name.com
- Đảm bảo không có dấu `.` ở cuối giá trị CNAME
- Đợi thêm 10-15 phút
- Clear browser cache: Ctrl + Shift + Delete

**❌ "Not Secure" warning:**
- Railway chưa cấp SSL
- Đợi 5-10 phút sau khi DNS verified
- Railway tự động cấp SSL certificate

**❌ DNS không resolve:**
- Kiểm tra: `nslookup shop.example.com`
- Nếu không thấy, kiểm tra lại DNS records trên Name.com
- Thử `dig shop.example.com` hoặc dùng [dnschecker.org](https://dnschecker.org/)

### 📋 Checklist Setup Domain

- [ ] Lấy CNAME từ Railway Custom Domain
- [ ] Thêm CNAME record vào Name.com DNS
- [ ] Đợi DNS propagate (5-30 phút)
- [ ] Verify "Active" trên Railway
- [ ] Cập nhật NEXT_PUBLIC_BASE_URL
- [ ] Test truy cập domain
- [ ] Kiểm tra SSL certificate (ổ khóa xanh)

---

## 🔐 BẢO MẬT

### Cần làm sau khi deploy:

1. **Đổi JWT_SECRET** thành chuỗi ngẫu nhiên mạnh
2. **Không commit** file `.env` lên GitHub
3. **Whitelist IP** trong MongoDB Atlas (chỉ Railway IPs nếu biết)
4. **Bật 2FA** cho tài khoản Railway và GitHub

---

## 🚀 AUTO-DEPLOY

Railway tự động deploy mỗi khi bạn push code lên GitHub:

```bash
# Trên máy local
git add .
git commit -m "Update feature"
git push origin master
```

→ Railway tự động build và deploy trong 2-5 phút

---

## 📱 CẬP NHẬT CODE

### Quy trình update:

1. Sửa code trên máy local
2. Test: `npm run dev`
3. Build test: `npm run build`
4. Commit và push:
   ```bash
   git add .
   git commit -m "Fix bug xyz"
   git push
   ```
5. Kiểm tra Railway Deployments tab
6. Đợi build xong (~3-5 phút)
7. Test trên production

---

## 💰 CHI PHÍ

### Railway Free Tier:
- **$5 credit/tháng** (đủ cho app nhỏ/vừa)
- ~500 giờ runtime
- Unlimited bandwidth

### Nếu cần upgrade:
- **Hobby Plan**: $5/month
- **Pro Plan**: $20/month
- Pay as you go nếu vượt giới hạn

---

## 📞 HỖ TRỢ

### Nếu gặp vấn đề:

1. **Xem logs** trong Railway Deployments
2. **Kiểm tra** tất cả biến môi trường đã đúng
3. **Test local** trước: `npm run build` và `npm start`
4. **MongoDB Atlas**: Kiểm tra Network Access và Database Access

### Tài liệu tham khảo:

- [Railway Docs](https://docs.railway.app/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)

---

## ✅ CHECKLIST DEPLOY

Đánh dấu khi hoàn thành:

- [ ] Push code lên GitHub
- [ ] Tạo MongoDB Atlas cluster (hoặc Railway MongoDB)
- [ ] Tạo Railway project từ GitHub repo
- [ ] Thêm biến `MONGODB_URI`
- [ ] Thêm biến `JWT_SECRET`
- [ ] Thêm biến `NODE_ENV=production`
- [ ] Generate Railway domain
- [ ] Thêm biến `NEXT_PUBLIC_BASE_URL`
- [ ] Kiểm tra `/api/health` → `{"ok":true}`
- [ ] Kiểm tra trang chủ load được
- [ ] Test đăng ký / đăng nhập
- [ ] (Optional) Thêm biến Stripe nếu cần
- [ ] (Optional) Thêm biến Cloudinary nếu cần

---

## 🎉 HOÀN TẤT!

App của bạn đã online tại:
```
https://your-app.railway.app
```

**Chúc mừng! 🚀🎊**

---

*Cập nhật lần cuối: 13/12/2025*
