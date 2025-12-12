const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Folder lưu ảnh trong public
const IMAGES_DIR = path.join(__dirname, '../public/products');

// Tạo folder nếu chưa tồn tại
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  console.log('✅ Created directory:', IMAGES_DIR);
}

// Danh sách ảnh đơn giản từ Unsplash
const productImages = [
  // ĐIỆN THOẠI (12 ảnh)
  { id: 'phone-1', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
  { id: 'phone-2', url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600' },
  { id: 'phone-3', url: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600' },
  { id: 'phone-4', url: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600' },
  { id: 'phone-5', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600' },
  { id: 'phone-6', url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
  { id: 'phone-7', url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
  { id: 'phone-8', url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600' },
  { id: 'phone-9', url: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600' },
  { id: 'phone-10', url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600' },
  { id: 'phone-11', url: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=600' },
  { id: 'phone-12', url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600' },
  
  // LAPTOP (6 ảnh)
  { id: 'laptop-1', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600' },
  { id: 'laptop-2', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600' },
  { id: 'laptop-3', url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600' },
  { id: 'laptop-4', url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600' },
  { id: 'laptop-5', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600' },
  { id: 'laptop-6', url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600' },
  
  // TABLET (5 ảnh)
  { id: 'tablet-1', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600' },
  { id: 'tablet-2', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600' },
  { id: 'tablet-3', url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600' },
  { id: 'tablet-4', url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600' },
  { id: 'tablet-5', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600' },
  
  // PHỤ KIỆN (8 ảnh)
  { id: 'accessory-1', url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600' },
  { id: 'accessory-2', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
  { id: 'accessory-3', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600' },
  { id: 'accessory-4', url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600' },
  { id: 'accessory-5', url: 'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?w=600' },
  { id: 'accessory-6', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
  { id: 'accessory-7', url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600' },
  { id: 'accessory-8', url: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600' },
];

// Hàm download file với follow redirect
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
        downloadFile(response.headers.location, filePath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      const file = fs.createWriteStream(filePath);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filePath);
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    });
    
    request.on('error', (err) => {
      reject(err);
    });
    
    // Timeout sau 30s
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Main function
async function main() {
  console.log('📥 Downloading product images to local storage...\n');
  console.log(`📁 Target directory: ${IMAGES_DIR}\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < productImages.length; i++) {
    const item = productImages[i];
    const fileName = `${item.id}.jpg`;
    const filePath = path.join(IMAGES_DIR, fileName);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`[${i + 1}/${productImages.length}] ⏭️  ${fileName} - Already exists`);
      successCount++;
      continue;
    }
    
    console.log(`[${i + 1}/${productImages.length}] 📥 Downloading ${fileName}...`);
    
    try {
      await downloadFile(item.url, filePath);
      const stats = fs.statSync(filePath);
      console.log(`  ✅ Downloaded (${(stats.size / 1024).toFixed(1)} KB)`);
      successCount++;
      
      // Delay để tránh spam requests
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      failCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`  ✅ Success: ${successCount}/${productImages.length}`);
  console.log(`  ❌ Failed: ${failCount}/${productImages.length}`);
  console.log('\n✨ Done! Images saved to public/products/');
  console.log('💡 Update seed endpoint to use: /products/phone-1.jpg, /products/laptop-1.jpg, etc.');
}

main().catch(console.error);
