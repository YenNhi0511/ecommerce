# 📊 Hệ Thống Phân Tích Hành Vi Người Dùng

## Tổng quan

Hệ thống analytics chạy độc lập trên **port 3003** với đầy đủ tính năng phân tích hành vi người dùng chuẩn production.

## 🚀 Chạy Analytics System

```bash
# Chạy riêng analytics (port 3003)
npm run dev:analytics

# Hoặc chạy tất cả ports
npm run dev:all
```

Truy cập: **http://localhost:3003**

## ✨ Tính năng

### 1. 📊 Dashboard Tổng Quan

- Thống kê realtime: Total Events, Unique Users, Product Views, Add to Cart, Orders
- Conversion Rate tracking
- Conversion Funnel visualization
- Top Products & Top Searches
- Time range filter (24h, 7 days, 30 days, 90 days)

**URL:** `/admin/analytics`

### 2. 📝 Event Explorer

Xem chi tiết từng sự kiện với khả năng:

- **Filter theo:**
  - Event type (VIEW, CART, SEARCH, ORDER, CLICK)
  - Date range (from/to)
  - Session ID
  - Product ID
- **Stats Cards:** Total Events, Unique Sessions, Unique Users, Event Types
- **Event Table với:**
  - Icon và color-coding cho mỗi loại event
  - Timestamp, Session ID, User status
  - Event metadata
- **Detail Modal:** Xem full JSON của event
- **Link to Journey:** Nhảy trực tiếp đến User Journey từ event

**URL:** `/admin/analytics/events`

**Event Types:**

- 👁️ `PRODUCT_VIEW_*` - Xem sản phẩm (blue)
- 🛒 `CART_*` - Thao tác giỏ hàng (green)
- 🔍 `SEARCH*` - Tìm kiếm (purple)
- ✅ `ORDER_*` - Đặt hàng (red)
- 👆 `UI_CLICK_*` - Click UI (gray)

### 3. 🗺️ User Journey

Trực quan hóa hành trình người dùng theo session:

- **Timeline View:** Hiển thị các bước theo thời gian thực
- **Step-by-step với:**
  - Numbered steps với color-coding
  - Event icon và tên
  - Metadata chi tiết (product, price, quantity)
  - Time gap giữa các events
- **Session Info:**
  - Total events
  - Duration
  - Status (Đã mua / Có giỏ hàng / Đang xem)
  - Products viewed, Searches, Cart adds
- **Summary Stats:**
  - Tổng thời gian session
  - Số sản phẩm xem
  - Số lần thêm giỏ
  - Kết quả cuối cùng

**URL:** `/admin/analytics/journey?session={sessionId}`

### 4. 📉 Funnel Analysis (Custom)

Tạo và phân tích phễu chuyển đổi tùy chỉnh:

- **Funnel Builder:**
  - Drag-and-drop / Select events
  - Add/remove steps động
  - 7 event options: VIEW_LIST, VIEW_DETAIL, CART_ADD, CART_VIEW, CHECKOUT_START, ORDER_COMPLETE, SEARCH
- **Visualization:**
  - Horizontal bar chart với width động
  - Color-coded steps
  - Count và conversion rate trên mỗi bar
  - Dropoff warning cho high-loss steps
- **Stats Cards:**
  - Tổng số người bắt đầu
  - Hoàn thành
  - Tỷ lệ chuyển đổi tổng
  - Tổng rời bỏ
- **Detail Table:**
  - Conversion rate từng bước
  - Dropoff rate từng bước
  - Số lượng users

**URL:** `/admin/analytics/funnel`

## 📡 API Endpoints

### Analytics Tracking

```
POST /api/analytics/track
Body: { event, metadata, sessionId, userId }
```

### Overview Stats

```
GET /api/analytics/overview?days=7
Response: { overview: {...}, topProducts: [...], topSearches: [...] }
```

### Conversion Funnel

```
GET /api/analytics/funnel?days=7
Response: { funnel: [...] }
```

### Events List

```
GET /api/analytics/events?event=CART_ADD&from=2024-01-01&to=2024-01-31&sessionId=xxx&limit=100
Response: { events: [...], total: 123 }
```

### User Journey

```
GET /api/analytics/journey?sessionId=xxx
Response: { events: [...], sessionInfo: {...} }
```

### Custom Funnel

```
POST /api/analytics/funnel/custom
Body: { events: ['PRODUCT_VIEW_LIST', 'CART_ADD', 'ORDER_COMPLETE'], timeRange: '7d' }
Response: { steps: [...] }
```

## 🗄️ Database Schema

### UserBehavior Collection

```javascript
{
  _id: ObjectId,
  event: String,           // Event type
  timestamp: Date,         // Event time
  sessionId: String,       // Anonymous session
  userId: String,          // User ID (if logged in)
  metadata: {
    productId: String,
    productName: String,
    price: Number,
    quantity: Number,
    query: String,
    resultsCount: Number,
    totalAmount: Number,
    // ... other event-specific data
  },
  ipAddress: String,
  userAgent: String
}
```

**Indexes:**

- `event` (for filtering)
- `timestamp` (for time-based queries)
- `sessionId` (for journey tracking)
- `userId` (for user analysis)

## 🎯 Event Types

### Product Views

- `PRODUCT_VIEW_LIST` - Xem danh sách
- `PRODUCT_VIEW_DETAIL` - Xem chi tiết
- `PRODUCT_VIEW_IMAGE` - Xem ảnh

### Cart Actions

- `CART_ADD` - Thêm vào giỏ
- `CART_REMOVE` - Xóa khỏi giỏ
- `CART_UPDATE` - Cập nhật số lượng
- `CART_VIEW` - Xem giỏ hàng
- `CART_CLEAR` - Xóa toàn bộ

### Search

- `SEARCH_QUERY` - Tìm kiếm
- `SEARCH_FILTER` - Lọc kết quả
- `SEARCH_SORT` - Sắp xếp

### Orders

- `CHECKOUT_START` - Bắt đầu thanh toán
- `CHECKOUT_COMPLETE` - Điền form xong
- `ORDER_CREATE` - Tạo đơn
- `ORDER_COMPLETE` - Hoàn tất đơn

### UI Interactions

- `UI_CLICK_BANNER` - Click banner
- `UI_CLICK_CATEGORY` - Click danh mục
- `UI_CLICK_FILTER` - Click bộ lọc
- `UI_CLICK_SORT` - Click sắp xếp

## 🔧 Configuration

### Environment Variables

```env
# App mode for port routing
APP_MODE=analytics

# MongoDB connection
MONGODB_URI=mongodb+srv://...

# Optional
PORT=3003
```

### package.json Scripts

```json
{
  "dev:analytics": "set PORT=3003&& set APP_MODE=analytics&& next dev -p 3003",
  "dev:all": "concurrently \"npm run dev:user\" \"npm run dev:admin\" \"npm run dev:seller\" \"npm run dev:analytics\""
}
```

## 📈 Usage Examples

### Tracking Events (Client-side)

```typescript
import { useAnalytics } from "@/context/AnalyticsContext";

function ProductPage() {
  const { trackProductView, trackAddToCart } = useAnalytics();

  useEffect(() => {
    trackProductView(product.id, product.name, product.price);
  }, [product]);

  const handleAddToCart = () => {
    trackAddToCart(product.id, product.name, product.price, 1);
  };
}
```

### Querying Events (API)

```typescript
// Get all cart adds in last 7 days
const response = await fetch(
  "/api/analytics/events?event=CART_ADD&from=2024-01-01&to=2024-01-07"
);
const { events, total } = await response.json();

// Get user journey
const journey = await fetch("/api/analytics/journey?sessionId=abc123");
const { events, sessionInfo } = await journey.json();
```

## 🎨 UI Components

### Stats Card

```tsx
<div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
  <div className="text-sm opacity-90">Label</div>
  <div className="text-3xl font-bold mt-2">{value}</div>
</div>
```

### Event Icon

```tsx
const getEventIcon = (type: string) => {
  if (type.includes("VIEW")) return "👁️";
  if (type.includes("CART")) return "🛒";
  if (type.includes("SEARCH")) return "🔍";
  if (type.includes("ORDER")) return "✅";
  return "📊";
};
```

## 🚧 Roadmap (Chưa implement)

- [ ] 🎯 **Segmentation** - Phân khúc người dùng
- [ ] 📊 **Cohort & Retention** - Phân tích cohort
- [ ] 🔥 **Heatmap** - Click heatmap
- [ ] 🛍️ **Product Analytics** - Deep product insights
- [ ] 📢 **Campaign/UTM** - Traffic source analysis
- [ ] ⚠️ **Alerts** - Threshold-based alerts
- [ ] ⚙️ **Admin/Settings** - Project management

## 📝 Notes

- Analytics chạy **không cần authentication** (standalone mode)
- Session ID được tạo tự động cho anonymous users
- Dữ liệu được lưu trong MongoDB collection `userbehaviors`
- UI responsive, mobile-friendly
- Color-coding nhất quán across all pages
- Real-time tracking (no batch processing)

## 🐛 Troubleshooting

### Port đã được sử dụng

```bash
# Windows
netstat -ano | findstr :3003
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3003 | xargs kill
```

### MongoDB connection failed

- Kiểm tra `MONGODB_URI` trong `.env.local`
- Verify IP whitelist trong MongoDB Atlas
- Test connection với MongoDB Compass

### Events không hiển thị

- Check browser console for tracking errors
- Verify AnalyticsContext is wrapped around components
- Check MongoDB collection có data không

## 📞 Support

Liên hệ developer để báo lỗi hoặc góp ý cải thiện.
