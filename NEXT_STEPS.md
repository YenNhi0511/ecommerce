# Các bước hoàn thiện website TMĐT

## ✅ Đã hoàn thành

1. **Fix giá sản phẩm**: Điều chỉnh tỷ giá USD->VND từ 24,000 lên 25,000

## 🔧 Cần làm tiếp

### 2. Fix trang chi tiết sản phẩm (ĐANG LÀM)

**File**: `src/app/san-pham/[id]/page.tsx`
**Vấn đề**:

- Sản phẩm liên quan chưa hoạt động
- Chưa có phần đánh giá/reviews
- Thiếu chức năng thêm giỏ hàng

**Giải pháp**:

```typescript
// Thêm hàm lấy sản phẩm liên quan
async function getRelatedProducts(category: string, currentId: string) {
  await dbConnect();
  return await Product.find({
    category,
    _id: { $ne: currentId },
    isActive: true,
  })
    .limit(4)
    .lean();
}
```

### 3. Thêm chức năng đánh giá sản phẩm

**File mới**: `src/app/api/reviews/route.ts`
**Chức năng**:

- POST: Thêm review mới
- GET: Lấy danh sách reviews theo productId

### 4. Fix chức năng giỏ hàng

**File**: `src/app/gio-hang/page.tsx`
**Cần**:

- Dùng localStorage hoặc MongoDB để lưu giỏ hàng
- API: `/api/cart` (GET, POST, PUT, DELETE)
- Context Provider cho cart state

**Tạo file**: `src/context/CartContext.tsx`

```typescript
"use client";
import { createContext, useContext, useState, useEffect } from "react";

export const CartContext = createContext({});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const addToCart = (product: any) => {
    // Logic thêm vào giỏ
  };

  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}
```

### 5. Hoàn thiện đăng nhập/đăng ký

**Files**:

- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/login/route.ts`

**Cần**:

```bash
npm install bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

**Code mẫu register**:

```typescript
import bcrypt from "bcryptjs";
import User from "@/models/User";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    name,
  });

  return NextResponse.json({ success: true });
}
```

### 6. Fix lọc theo giá và thương hiệu

**File**: `src/app/danh-muc/[slug]/page.tsx`
**Cần thêm**:

- Query params cho filter: `?minPrice=1000000&maxPrice=5000000&brands=Apple,Samsung`
- Client component cho filter UI
- Server component nhận searchParams và filter DB

### 7. Redesign giao diện hiện đại

**Màu sắc gợi ý**:

- Primary: #3B82F6 (blue-500)
- Secondary: #8B5CF6 (violet-500)
- Accent: #F59E0B (amber-500)

**Components cần cải thiện**:

- Header: Sticky, shadow on scroll
- Product cards: Hover effects, quick view
- Buttons: Rounded-lg, hover animations
- Responsive: Mobile-first design

### 8. Đặt tên thương hiệu

**Gợi ý tên**:

1. **TechZone** - Khu vực công nghệ
2. **DigiMart** - Chợ điện tử
3. **SmartHub** - Trung tâm thông minh
4. **GearSpot** - Điểm đến thiết bị
5. **ByteStore** - Cửa hàng công nghệ

**Cần thay đổi**:

- Logo trong Header
- Favicon
- Meta tags (title, description)
- Footer branding

## 📝 Thứ tự ưu tiên thực hiện

1. **CẤP BÁCH** (Phải có ngay):

   - ✅ Fix giá sản phẩm
   - 🔄 Fix giỏ hàng (localStorage)
   - 🔄 Đăng nhập/đăng ký cơ bản

2. **QUAN TRỌNG** (Nên có):

   - Fix trang chi tiết (sản phẩm liên quan)
   - Lọc theo giá/brand
   - Đặt tên brand

3. **BỔ SUNG** (Có tốt):
   - Đánh giá sản phẩm
   - UI/UX cải thiện

## 🚀 Lệnh hữu ích

```bash
# Seed lại data sau khi fix giá
curl http://localhost:3000/api/seed

# Clear localStorage (console browser)
localStorage.clear()

# Check errors
npm run build
```

## 📌 Lưu ý quan trọng

- **Seed lại data** sau khi fix giá để áp dụng
- **localStorage** cho giỏ hàng không cần đăng nhập
- **bcryptjs** để hash password, KHÔNG LƯU plain text
- **Filter** dùng MongoDB query, không filter client-side
- **Mobile responsive** test trên nhiều kích thước màn hình

---

**Bạn muốn tôi bắt đầu implement phần nào trước?**
Ưu tiên: Giỏ hàng > Đăng nhập > Filter > UI
