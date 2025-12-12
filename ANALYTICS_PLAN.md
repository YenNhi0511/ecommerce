# Kế hoạch Xây dựng Hệ thống Phân tích Hành vi Người dùng

## 🎯 Mục tiêu

Xây dựng hệ thống phân tích hành vi người dùng toàn diện để:

- **Thu thập dữ liệu:** Tracking toàn bộ hành động của người dùng trên website
- **Phân tích:** Hiểu rõ hành vi, xu hướng, và mô hình mua sắm
- **Cá nhân hóa:** Gợi ý sản phẩm phù hợp dựa trên lịch sử
- **Tối ưu hóa:** Cải thiện UX, tăng conversion rate
- **Báo cáo:** Dashboard trực quan cho Admin/Seller

---

## 📊 Phase 1: Thu thập Dữ liệu (Data Collection)

### 1.1 Các Hành vi Cần Track

#### **A. Hành vi Tìm kiếm (Search Behavior)**

- ✅ `SEARCH` - Người dùng tìm kiếm với keyword
- ✅ `SEARCH_PRODUCT_CLICK` - Click vào sản phẩm từ kết quả tìm kiếm
- ✅ `SEARCH_NO_RESULTS` - Tìm kiếm không có kết quả

#### **B. Hành vi Xem sản phẩm (Product View)**

- ✅ `PRODUCT_VIEW_HOME` - Xem sản phẩm từ trang chủ
- ✅ `PRODUCT_VIEW_CATEGORY` - Xem sản phẩm từ danh mục
- ✅ `PRODUCT_VIEW_SEARCH` - Xem sản phẩm từ tìm kiếm
- ✅ `PRODUCT_VIEW_BANNER` - Xem sản phẩm từ banner quảng cáo
- ✅ `PRODUCT_VIEW_RECOMMENDATION` - Xem sản phẩm từ gợi ý

#### **C. Hành vi Tương tác (Engagement)**

- ✅ `ADD_TO_CART` - Thêm sản phẩm vào giỏ hàng
- ✅ `REMOVE_FROM_CART` - Xóa sản phẩm khỏi giỏ hàng
- ✅ `ADD_TO_WISHLIST` - Thêm vào danh sách yêu thích
- ✅ `REMOVE_FROM_WISHLIST` - Xóa khỏi wishlist
- ✅ `SHARE_PRODUCT` - Chia sẻ sản phẩm
- ✅ `REVIEW_SUBMIT` - Gửi đánh giá sản phẩm

#### **D. Hành vi Mua hàng (Purchase Funnel)**

- ✅ `CHECKOUT_STARTED` - Bắt đầu thanh toán
- ✅ `CHECKOUT_COMPLETED` - Hoàn tất đơn hàng
- ✅ `CHECKOUT_ABANDONED` - Bỏ giỏ hàng giữa chừng
- ✅ `PAYMENT_METHOD_SELECTED` - Chọn phương thức thanh toán
- ✅ `APPLY_COUPON` - Áp dụng mã giảm giá

#### **E. Hành vi Điều hướng (Navigation)**

- ✅ `PAGE_VIEW` - Xem trang (với URL và title)
- ✅ `SESSION_START` - Bắt đầu phiên làm việc
- ✅ `SESSION_END` - Kết thúc phiên
- ✅ `CLICK_BANNER` - Click vào banner/promotion

### 1.2 Cấu trúc Dữ liệu

```typescript
UserBehavior Model:
{
  _id: ObjectId,
  userId: ObjectId | null,           // null nếu chưa login
  sessionId: String,                  // Để track anonymous users
  eventType: String,                  // Loại hành vi
  eventData: {
    productId?: ObjectId,
    category?: String,
    searchQuery?: String,
    url?: String,
    referrer?: String,
    value?: Number,                   // Giá trị đơn hàng
    metadata?: Object                  // Dữ liệu bổ sung
  },
  deviceInfo: {
    userAgent: String,
    deviceType: String,               // mobile/tablet/desktop
    browser: String,
    os: String,
    screenResolution: String
  },
  location: {
    ip: String,
    country: String,
    city: String
  },
  timestamp: Date,
  createdAt: Date
}
```

### 1.3 Implementation Tasks

**Task 1.1: Tạo Analytics Context**

```typescript
// src/context/AnalyticsContext.tsx
-trackEvent(eventType, eventData) -
  trackPageView(url, title) -
  trackProductView(productId, source) -
  trackAddToCart(productId, quantity) -
  trackSearch(query, resultsCount) -
  trackCheckout(stage, cartValue);
```

**Task 1.2: Tạo API Endpoint**

```
POST /api/analytics/track
- Nhận event từ client
- Validate data
- Lưu vào database
- Return success response
```

**Task 1.3: Tích hợp vào Components**

- Trang sản phẩm → track product views
- Search bar → track search queries
- Cart → track add/remove
- Checkout → track funnel stages

---

## 📈 Phase 2: Xử lý và Phân tích (Data Processing)

### 2.1 Aggregation Queries

**Query 1: Top Products (Sản phẩm hot)**

```javascript
// Sản phẩm được xem nhiều nhất
db.userbehaviors.aggregate([
  { $match: { eventType: /PRODUCT_VIEW/ } },
  { $group: { _id: "$eventData.productId", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 },
]);
```

**Query 2: Search Trends (Xu hướng tìm kiếm)**

```javascript
// Keywords được tìm kiếm nhiều nhất
db.userbehaviors.aggregate([
  { $match: { eventType: "SEARCH" } },
  { $group: { _id: "$eventData.searchQuery", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);
```

**Query 3: Conversion Funnel**

```javascript
// Tỷ lệ chuyển đổi: View → Add to Cart → Checkout → Purchase
- Product views
- Add to cart rate
- Checkout started rate
- Purchase completion rate
```

**Query 4: User Journey**

```javascript
// Hành trình người dùng từ đầu đến cuối
db.userbehaviors.find({ sessionId }).sort({ timestamp: 1 });
```

### 2.2 Analytics API Endpoints

```
GET /api/analytics/overview
- Tổng số events
- Unique users
- Page views
- Conversion rate

GET /api/analytics/products/top
- Top viewed products
- Top added to cart
- Top purchased

GET /api/analytics/search/trends
- Popular search queries
- Search with no results
- Click-through rate

GET /api/analytics/funnel
- Conversion funnel data
- Drop-off points

GET /api/analytics/users/:userId/journey
- User behavior timeline
- Products viewed
- Purchase history
```

---

## 🤖 Phase 3: Gợi ý Thông minh (Recommendation Engine)

### 3.1 Các Loại Gợi ý

**A. Collaborative Filtering**

- "Người dùng xem sản phẩm này cũng xem..."
- Dựa trên hành vi của users tương tự

**B. Content-Based Filtering**

- Gợi ý sản phẩm cùng category
- Gợi ý sản phẩm cùng brand
- Gợi ý dựa trên specifications

**C. Trending Products**

- Sản phẩm hot trong 24h/7 ngày
- Sản phẩm mới về

**D. Personalized Recommendations**

- Dựa trên lịch sử xem
- Dựa trên wishlist
- Dựa trên đơn hàng cũ

### 3.2 Implementation

```typescript
Recommendation API:
GET /api/recommendations/related?productId=xxx
GET /api/recommendations/personalized?userId=xxx
GET /api/recommendations/trending
GET /api/recommendations/similar?productId=xxx
```

**Algorithm Logic:**

```javascript
function getRelatedProducts(productId) {
  // 1. Lấy users đã xem productId
  // 2. Tìm các sản phẩm khác mà users đó cũng xem
  // 3. Tính điểm dựa trên frequency
  // 4. Return top 10
}

function getPersonalizedRecommendations(userId) {
  // 1. Lấy lịch sử hành vi của user
  // 2. Tính điểm cho mỗi sản phẩm dựa trên:
  //    - Category preferences
  //    - Brand preferences
  //    - Price range
  //    - Recent views
  // 3. Filter sản phẩm đã mua
  // 4. Return top 20
}
```

---

## 📊 Phase 4: Dashboard Analytics

### 4.1 Admin Analytics Dashboard

**Page: /admin/analytics**

#### **Overview Section**

- 📈 Total users (new vs returning)
- 👁️ Total page views
- 🛒 Total add to carts
- 💰 Total revenue
- 📊 Conversion rate

#### **Real-time Section**

- Online users (last 5 minutes)
- Recent events feed
- Live orders

#### **Products Section**

- Top 10 viewed products (chart)
- Top 10 added to cart
- Top 10 purchased
- Products with high bounce rate

#### **Search Section**

- Top search keywords (word cloud)
- Failed searches (0 results)
- Search to purchase conversion

#### **Funnel Section**

- Visual funnel chart
- Drop-off rates at each stage
- Time spent in each stage

#### **Users Section**

- New users vs returning
- User retention rate
- Average session duration
- Geographic distribution (map)

#### **Traffic Sources**

- Direct
- Search engines
- Social media
- Referrals

### 4.2 Seller Analytics Dashboard

**Page: /seller/analytics**

- Sản phẩm của seller được xem nhiều nhất
- Conversion rate của từng sản phẩm
- Search keywords liên quan đến sản phẩm
- Thời điểm có traffic cao nhất

---

## 🔧 Phase 5: Tối ưu hóa và Tính năng Nâng cao

### 5.1 A/B Testing Framework

- Test different product layouts
- Test pricing strategies
- Test banner placements

### 5.2 Heat Maps

- Click heatmaps
- Scroll depth tracking
- Attention heatmaps

### 5.3 Cohort Analysis

- User retention by cohort
- LTV (Lifetime Value) analysis
- Churn prediction

### 5.4 Real-time Alerts

- Alert khi có sản phẩm trending
- Alert khi conversion rate giảm đột ngột
- Alert khi có lỗi thanh toán tăng cao

---

## 🗓️ Timeline Implementation

### **Week 1-2: Foundation**

✅ Setup UserBehavior model
✅ Create AnalyticsContext
✅ Implement basic tracking (page views, product views)
✅ Create /api/analytics/track endpoint

### **Week 3-4: Core Tracking**

✅ Track search behavior
✅ Track cart actions
✅ Track checkout funnel
✅ Track user sessions

### **Week 5-6: Analytics API**

✅ Build aggregation queries
✅ Create analytics API endpoints
✅ Test performance with sample data

### **Week 7-8: Dashboard**

✅ Build admin analytics dashboard
✅ Create charts and visualizations
✅ Implement filters (date range, product, user)

### **Week 9-10: Recommendations**

✅ Implement collaborative filtering
✅ Implement content-based filtering
✅ Create recommendation APIs
✅ Integrate recommendations into UI

### **Week 11-12: Advanced Features**

✅ Cohort analysis
✅ Real-time alerts
✅ Export reports (CSV, PDF)
✅ Performance optimization

---

## 💾 Database Indexes

Để tối ưu performance:

```javascript
// UserBehavior indexes
db.userbehaviors.createIndex({ userId: 1, timestamp: -1 });
db.userbehaviors.createIndex({ sessionId: 1, timestamp: -1 });
db.userbehaviors.createIndex({ eventType: 1, timestamp: -1 });
db.userbehaviors.createIndex({ "eventData.productId": 1 });
db.userbehaviors.createIndex({ timestamp: -1 });
```

---

## 🔐 Privacy & GDPR Compliance

### Considerations:

1. **User Consent:** Hiển thị cookie banner
2. **Data Anonymization:** Hash IP addresses
3. **Data Retention:** Xóa data cũ sau 12 tháng
4. **Right to be Forgotten:** API để xóa user data
5. **Data Export:** Cho phép users export dữ liệu của họ

---

## 📱 Tech Stack

**Frontend:**

- React Context API (AnalyticsContext)
- Chart.js / Recharts (visualizations)
- React Query (data fetching)

**Backend:**

- Next.js API Routes
- MongoDB Aggregation Pipeline
- Cron jobs (scheduled reports)

**Infrastructure:**

- Redis (caching hot queries)
- Queue system (background processing)

---

## 🎯 Success Metrics

1. **Data Collection:**

   - 95%+ tracking accuracy
   - < 100ms tracking overhead

2. **Analytics:**

   - Dashboard load time < 2s
   - Real-time updates within 5s

3. **Recommendations:**

   - 10%+ increase in CTR
   - 5%+ increase in conversion

4. **Business Impact:**
   - Understand customer journey
   - Identify bottlenecks
   - Increase revenue per user

---

## 🚀 Getting Started

**Immediate Next Steps:**

1. Review UserBehavior model (đã có)
2. Tạo AnalyticsContext
3. Implement basic tracking
4. Build first analytics dashboard
5. Test with sample data

**Priority Order:**

1. ⭐️⭐️⭐️ Product view tracking
2. ⭐️⭐️⭐️ Add to cart tracking
3. ⭐️⭐️⭐️ Checkout funnel
4. ⭐️⭐️ Search tracking
5. ⭐️⭐️ Admin dashboard
6. ⭐️ Recommendations
7. ⭐️ Advanced analytics

---

## 📝 Notes

- Bắt đầu đơn giản, mở rộng dần
- Focus vào actionable insights
- Đảm bảo privacy và compliance
- Optimize performance từ đầu
- Document everything

**Bạn muốn tôi bắt đầu implement từ phase nào?**
