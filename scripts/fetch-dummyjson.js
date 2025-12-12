const fs = require('fs');
const path = require('path');
const https = require('https');

// Folder lưu ảnh
const IMAGES_DIR = path.join(__dirname, '../public/products');

// Tạo folder nếu chưa tồn tại
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  console.log('✅ Created directory:', IMAGES_DIR);
}

// Hàm fetch data từ DummyJSON
async function fetchProducts() {
  return new Promise((resolve, reject) => {
    https.get('https://dummyjson.com/products?limit=200', (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.products);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Hàm download ảnh
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        downloadImage(response.headers.location, filePath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
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
    }).on('error', reject);
  });
}

// Main function
async function main() {
  console.log('🚀 Fetching products from DummyJSON API...\n');
  
  try {
    // Fetch products
    const products = await fetchProducts();
    console.log(`✅ Fetched ${products.length} products\n`);
    
    // Filter by category
    const smartphones = products.filter(p => p.category === 'smartphones');
    const laptops = products.filter(p => p.category === 'laptops');
    const tablets = products.filter(p => p.category === 'tablets');
    const accessories = products.filter(p => 
      ['mobile-accessories', 'mens-watches', 'womens-watches'].includes(p.category)
    );
    
    console.log('📊 Categories found:');
    console.log(`  📱 Smartphones: ${smartphones.length}`);
    console.log(`  💻 Laptops: ${laptops.length}`);
    console.log(`  📲 Tablets: ${tablets.length}`);
    console.log(`  🎧 Accessories: ${accessories.length}\n`);
    
    // Download images
    let successCount = 0;
    let failCount = 0;
    const mapping = [];
    
    // Combine all products
    const allProducts = [
      ...smartphones.slice(0, 12),
      ...laptops.slice(0, 6),
      ...tablets.slice(0, 5),
      ...accessories.slice(0, 8)
    ];
    
    console.log(`📥 Downloading ${allProducts.length} product images...\n`);
    
    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i];
      const imageUrl = product.thumbnail || product.images[0];
      
      // Tạo filename dựa theo category
      let prefix = 'product';
      if (smartphones.includes(product)) prefix = 'phone';
      else if (laptops.includes(product)) prefix = 'laptop';
      else if (tablets.includes(product)) prefix = 'tablet';
      else if (accessories.includes(product)) prefix = 'accessory';
      
      const index = prefix === 'phone' ? smartphones.indexOf(product) + 1 :
                    prefix === 'laptop' ? laptops.indexOf(product) + 1 :
                    prefix === 'tablet' ? tablets.indexOf(product) + 1 :
                    accessories.indexOf(product) + 1;
      
      const fileName = `${prefix}-${index}.jpg`;
      const filePath = path.join(IMAGES_DIR, fileName);
      
      console.log(`[${i + 1}/${allProducts.length}] ${product.title}`);
      console.log(`  📥 Downloading: ${fileName}...`);
      
      try {
        await downloadImage(imageUrl, filePath);
        const stats = fs.statSync(filePath);
        console.log(`  ✅ Downloaded (${(stats.size / 1024).toFixed(1)} KB)`);
        
        mapping.push({
          id: prefix + '-' + index,
          fileName: fileName,
          localPath: `/products/${fileName}`,
          title: product.title,
          brand: product.brand,
          price: product.price,
          category: product.category,
          originalUrl: imageUrl
        });
        
        successCount++;
        
        // Delay để tránh spam
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}`);
        failCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`  ✅ Success: ${successCount}/${allProducts.length}`);
    console.log(`  ❌ Failed: ${failCount}/${allProducts.length}`);
    
    // Save mapping
    const mappingPath = path.join(__dirname, 'product-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
    console.log(`\n💾 Saved mapping to: ${mappingPath}`);
    console.log('\n✨ Done! Images saved to public/products/');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
