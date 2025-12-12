// Script để generate test analytics data nhanh
const https = require('https');
const http = require('http');

function sendEvent(event) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(event);
    
    const options = {
      hostname: 'localhost',
      port: 3003,
      path: '/api/analytics/track',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`Status ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function generateTestAnalytics() {
  console.log('🚀 Generating test analytics data...');
  
  const productIds = [
    '675a0cd9e90b3cbb1e0d5a50',
    '675a0cd9e90b3cbb1e0d5a51', 
    '675a0cd9e90b3cbb1e0d5a52',
    '675a0cd9e90b3cbb1e0d5a53',
    '675a0cd9e90b3cbb1e0d5a54'
  ];
  
  const productNames = [
    'iPhone 15 Pro Max',
    'Samsung Galaxy S24 Ultra',
    'MacBook Pro M3',
    'AirPods Pro 2',
    'iPad Pro 12.9'
  ];
  
  const searches = ['iphone', 'samsung', 'laptop', 'tai nghe', 'macbook', 'ipad'];
  
  const events = [];
  
  // Generate 50 product views
  for (let i = 0; i < 50; i++) {
    const productIdx = i % productIds.length;
    events.push({
      sessionId: `session_${Math.floor(i / 3)}`,
      event: 'PRODUCT_VIEW_CATEGORY',
      metadata: {
        productId: productIds[productIdx],
        productName: productNames[productIdx],
        category: 'dien-thoai',
        source: 'category'
      }
    });
  }
  
  // Generate 20 add to cart
  for (let i = 0; i < 20; i++) {
    const productIdx = i % productIds.length;
    events.push({
      sessionId: `session_${Math.floor(i / 2)}`,
      event: 'CART_ADD',
      metadata: {
        productId: productIds[productIdx],
        productName: productNames[productIdx],
        quantity: 1,
        price: 20000000 + (i * 1000000)
      }
    });
  }
  
  // Generate 15 searches
  for (let i = 0; i < 15; i++) {
    events.push({
      sessionId: `session_search_${i}`,
      event: 'SEARCH_RESULTS_VIEW',
      metadata: {
        query: searches[i % searches.length],
        resultsCount: 10 + Math.floor(Math.random() * 40)
      }
    });
  }
  
  // Generate 5 checkouts
  for (let i = 0; i < 5; i++) {
    events.push({
      sessionId: `session_order_${i}`,
      event: 'ORDER_COMPLETE',
      metadata: {
        orderId: `test_order_${Date.now()}_${i}`,
        totalAmount: 25000000 + (i * 5000000)
      }
    });
  }
  
  console.log(`📊 Sending ${events.length} events to tracking API...`);
  
  // Send events in batches
  for (let i = 0; i < events.length; i++) {
    try {
      await sendEvent(events[i]);
      console.log(`✅ Event ${i + 1}/${events.length}: ${events[i].event}`);
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`❌ Error sending event ${i + 1}:`, error.message);
    }
  }
  
  console.log('\n✨ Done! Refresh dashboard at http://localhost:3003/admin/analytics');
  console.log('\n📈 Expected results:');
  console.log('   • Product Views: ~50');
  console.log('   • Add to Cart: ~20');
  console.log('   • Orders: ~5');
  console.log('   • Conversion Rate: ~10%');
  console.log('   • Top Products: iPhone, Samsung, MacBook...');
  console.log('   • Top Searches: iphone, samsung, laptop...');
}

// Run the script
generateTestAnalytics().catch(console.error);
