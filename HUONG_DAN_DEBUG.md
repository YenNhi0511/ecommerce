# Hướng Dẫn Debug và Fix Lỗi 404 Trang Chủ

## Nguyên nhân có thể gây lỗi GET / 404

### 1. Lỗi kết nối MongoDB

- **Triệu chứng**: Server start nhưng trang chủ 404
- **Nguyên nhân**: `dbConnect()` fail do URI sai hoặc network issue
- **Cách kiểm tra**:
  ```bash
  # Kiểm tra MongoDB Atlas connection
  - Vào MongoDB Atlas > Network Access > Thêm IP 0.0.0.0/0
  - Kiểm tra URI trong lib/mongodb.ts
  ```

### 2. Lỗi cấu trúc thư mục

- **Triệu chứng**: Build ok nhưng runtime 404
- **Nguyên nhân**: File page.tsx không ở đúng vị trí
- **Cách kiểm tra**:
  ```
  ecommerce/
  ├── src/
  │   ├── app/
  │   │   ├── page.tsx      ← Phải có
  │   │   ├── layout.tsx    ← Phải có
  │   │   └── globals.css   ← Phải có
  ```

### 3. Lỗi import/font

- **Triệu chứng**: Build fail hoặc runtime error
- **Nguyên nhân**: Font Geist không tồn tại, lucide-react thiếu
- **Đã fix**: Đã thay Geist bằng Inter, bỏ lucide-react

### 4. Lỗi TypeScript

- **Triệu chứng**: Build fail với type errors
- **Nguyên nhân**: Type mismatch trong components
- **Đã fix**: Thêm type assertions

## Các bước debug

### Bước 1: Kiểm tra build

```bash
npm run build
```

- Nếu fail → Fix errors theo log
- Nếu success → Tiếp bước 2

### Bước 2: Kiểm tra MongoDB

```bash
# Tạo file test connection
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://yennhi0511:yennhi0511@cluster0.txz3p.mongodb.net/TMDT?appName=Cluster0')
.then(() => console.log('Connected'))
.catch(err => console.error('Error:', err));
"
```

### Bước 3: Chạy server và xem log

```bash
npm run dev
```

- Mở http://localhost:3000
- Nếu 404, kiểm tra console browser (F12 > Console)
- Nếu có lỗi MongoDB, sẽ thấy trong terminal

### Bước 4: Test từng component

- Comment `await getHotProducts()` trong page.tsx
- Nếu load được → Lỗi ở MongoDB
- Nếu vẫn 404 → Lỗi cấu trúc

## Cách fix từng lỗi

### Fix MongoDB connection

1. Kiểm tra Network Access trong MongoDB Atlas
2. Thêm IP: 0.0.0.0/0 (Allow Access from Anywhere)
3. Verify username/password trong URI

### Fix nếu thiếu data

```bash
# Seed 200 sản phẩm
curl -X POST http://localhost:3000/api/seed
# Hoặc truy cập http://localhost:3000/seed trong browser
```

### Fix cấu trúc (nếu cần)

```
# Đảm bảo cấu trúc đúng
ecommerce/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── page.tsx       # Trang chủ
│   │   ├── layout.tsx     # Layout
│   │   └── globals.css    # CSS
│   ├── components/        # Components
│   ├── lib/              # Utilities
│   └── models/           # MongoDB models
├── next.config.mjs       # Config
└── package.json
```

## Kiểm tra sau khi fix

1. `npm run build` → Success
2. `npm run dev` → Server start
3. Mở http://localhost:3000 → Thấy trang chủ
4. Kiểm tra API: http://localhost:3000/api/products → Trả về JSON

## Lưu ý quan trọng

- Đảm bảo Node.js >= 20.9.0
- MongoDB Atlas phải allow network access
- Nếu dùng local MongoDB, thay URI thành `mongodb://localhost:27017/TMDT`

## Troubleshooting nâng cao

- Clear cache: `rm -rf .next node_modules/.cache`
- Reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check logs: Trong terminal chạy `npm run dev`, xem full log
