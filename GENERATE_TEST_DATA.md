# 🧪 Generate Test Analytics Data

## Cách Tạo Dữ Liệu Test Để Xem Dashboard Hoạt Động

### Phương án 1: Tương tác thật trên website

1. **Browse products** - Mở tab mới:

   ```
   http://localhost:3003/danh-muc/dien-thoai
   ```

   → Click vào 5-10 sản phẩm khác nhau

2. **Add to cart** - Ở trang sản phẩm:
   → Click nút "Thêm vào giỏ"

3. **Search** - Dùng search bar:
   → Tìm "iphone", "samsung", "laptop"

4. **Refresh dashboard**:
   ```
   http://localhost:3003/admin/analytics
   ```
   → Sẽ thấy số liệu cập nhật!

---

### Phương án 2: Insert test data trực tiếp MongoDB

Tạo file seed script để test nhanh:

```javascript
// scripts/seed-analytics.js
const { MongoClient, ObjectId } = require("mongodb");

const uri = "your_mongodb_uri";
const client = new MongoClient(uri);

async function seedAnalytics() {
  try {
    await client.connect();
    const db = client.db("TMDT");
    const behaviors = db.collection("userbehaviors");

    const now = new Date();
    const testData = [];

    // Simulate 100 product views
    for (let i = 0; i < 100; i++) {
      testData.push({
        userId: i % 5 === 0 ? new ObjectId() : null, // 20% logged in users
        sessionId: `session_${Math.floor(i / 10)}`,
        event: "PRODUCT_VIEW_CATEGORY",
        timestamp: new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
        metadata: {
          productId: `product_${Math.floor(Math.random() * 20)}`,
          productName: `Product ${Math.floor(Math.random() * 20)}`,
          category: ["dien-thoai", "laptop", "phu-kien"][
            Math.floor(Math.random() * 3)
          ],
        },
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
      });
    }

    // Simulate 30 add to cart
    for (let i = 0; i < 30; i++) {
      testData.push({
        userId: null,
        sessionId: `session_${Math.floor(i / 3)}`,
        event: "CART_ADD",
        timestamp: new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000),
        metadata: {
          productId: `product_${Math.floor(Math.random() * 20)}`,
          productName: `Product ${Math.floor(Math.random() * 20)}`,
          quantity: 1,
          price: 10000000,
        },
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
      });
    }

    // Simulate 20 searches
    for (let i = 0; i < 20; i++) {
      testData.push({
        userId: null,
        sessionId: `session_${i}`,
        event: "SEARCH_RESULTS_VIEW",
        timestamp: new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000),
        metadata: {
          query: ["iphone", "samsung", "laptop", "tai nghe", "sạc dự phòng"][
            i % 5
          ],
          resultsCount: Math.floor(Math.random() * 50),
        },
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
      });
    }

    // Simulate 5 checkouts
    for (let i = 0; i < 5; i++) {
      testData.push({
        userId: new ObjectId(),
        sessionId: `session_checkout_${i}`,
        event: "ORDER_COMPLETE",
        timestamp: new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000),
        metadata: {
          orderId: `order_${i}`,
          totalAmount: 15000000 + Math.random() * 10000000,
        },
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
      });
    }

    await behaviors.insertMany(testData);
    console.log(`✅ Inserted ${testData.length} test analytics events!`);
  } finally {
    await client.close();
  }
}

seedAnalytics();
```

**Chạy:**

```bash
node scripts/seed-analytics.js
```

---

### Phương án 3: API Test Script

Tạo test script gọi tracking API:

```javascript
// test-analytics.js
async function generateTestData() {
  const events = [
    // Product views
    ...Array(50)
      .fill()
      .map((_, i) => ({
        sessionId: `test_session_${i % 10}`,
        event: "PRODUCT_VIEW_CATEGORY",
        metadata: {
          productId: `675a0cd9e90b3cbb1e0d5a5${i % 20}`,
          productName: `Test Product ${i % 20}`,
          category: "dien-thoai",
        },
      })),
    // Add to cart
    ...Array(20)
      .fill()
      .map((_, i) => ({
        sessionId: `test_session_${i % 10}`,
        event: "CART_ADD",
        metadata: {
          productId: `675a0cd9e90b3cbb1e0d5a5${i % 20}`,
          productName: `Test Product ${i % 20}`,
          quantity: 1,
          price: 10000000,
        },
      })),
    // Searches
    ...Array(10)
      .fill()
      .map((_, i) => ({
        sessionId: `test_session_search_${i}`,
        event: "SEARCH_RESULTS_VIEW",
        metadata: {
          query: ["iphone", "samsung", "laptop", "airpods", "macbook"][i % 5],
          resultsCount: 15,
        },
      })),
  ];

  for (const event of events) {
    await fetch("http://localhost:3003/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  }

  console.log("✅ Generated test data!");
}

generateTestData();
```

**Chạy:**

```bash
node test-analytics.js
```

---

## 🔍 Sau khi tạo data

1. Refresh dashboard: `http://localhost:3003/admin/analytics`
2. Sẽ thấy:
   - **Product Views**: 50-100
   - **Add to Cart**: 20-30
   - **Conversion Rate**: ~30-40%
   - **Top Products**: Danh sách top 10
   - **Top Searches**: "iphone", "samsung", etc.
   - **Funnel**: Đầy màu sắc với drop-off rates

## ✨ Kết quả mong đợi

Dashboard sẽ có đầy đủ data và trông như một analytics dashboard thực sự!
