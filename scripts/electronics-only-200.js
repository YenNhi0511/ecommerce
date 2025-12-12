const fs = require('fs');
const path = require('path');
const https = require('https');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: 'dcpfzg46o',
  api_key: '246635433286241',
  api_secret: 'it6LV29ghMqhQb_Sg6ojX2JEeZs',
});

const IMAGES_DIR = path.join(__dirname, '../public/products');

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

async function fetchAllProducts() {
  return new Promise((resolve, reject) => {
    https.get('https://dummyjson.com/products?limit=0', (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data).products);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if ([301, 302].includes(response.statusCode)) {
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
    });
    
    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function uploadToCloudinary(filePath, publicId, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'tmdt_ecommerce',
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        timeout: 60000,
      });
      return result.secure_url;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

async function main() {
  console.log('🚀 Fetching products from DummyJSON...\n');
  
  try {
    const allProducts = await fetchAllProducts();
    
    // CHỈ LẤY ELECTRONICS!!!
    const electronicsCategories = ['smartphones', 'laptops', 'tablets', 'mobile-accessories'];
    const electronics = allProducts.filter(p => electronicsCategories.includes(p.category));
    
    console.log(`✅ Total products: ${allProducts.length}`);
    console.log(`📱 Electronics only: ${electronics.length}\n`);
    
    console.log('📊 Categories:');
    const byCat = {};
    electronics.forEach(p => {
      byCat[p.category] = (byCat[p.category] || 0) + 1;
    });
    Object.entries(byCat).forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count}`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 DOWNLOADING & UPLOADING ELECTRONICS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const results = [];
    let downloadSuccess = 0;
    let uploadSuccess = 0;
    let failed = 0;
    
    for (let i = 0; i < electronics.length; i++) {
      const product = electronics[i];
      const imageUrl = product.thumbnail || product.images[0];
      const fileName = `electronics-${i + 1}.jpg`;
      const filePath = path.join(IMAGES_DIR, fileName);
      const publicId = `electronics-${i + 1}`;
      
      console.log(`[${i + 1}/${electronics.length}] ${product.title}`);
      console.log(`  Category: ${product.category}`);
      
      let cloudinaryUrl = null;
      
      // Download
      if (!fs.existsSync(filePath)) {
        try {
          await downloadImage(imageUrl, filePath);
          const stats = fs.statSync(filePath);
          console.log(`  📥 Downloaded (${(stats.size / 1024).toFixed(1)} KB)`);
          downloadSuccess++;
        } catch (error) {
          console.log(`  ❌ Download failed: ${error.message}`);
          failed++;
          continue;
        }
      } else {
        console.log(`  ⏭️  Already downloaded`);
        downloadSuccess++;
      }
      
      // Upload to Cloudinary
      try {
        cloudinaryUrl = await uploadToCloudinary(filePath, publicId);
        console.log(`  ☁️  Uploaded to Cloudinary`);
        uploadSuccess++;
      } catch (error) {
        console.log(`  ❌ Upload failed: ${error.message}`);
        failed++;
      }
      
      results.push({
        id: publicId,
        title: product.title,
        brand: product.brand,
        price: product.price,
        category: product.category,
        description: product.description,
        rating: product.rating,
        stock: product.stock,
        thumbnail: product.thumbnail,
        images: product.images,
        cloudinaryUrl: cloudinaryUrl,
        localPath: `/products/${fileName}`
      });
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📦 Electronics products: ${results.length}`);
    console.log(`📥 Downloaded: ${downloadSuccess}`);
    console.log(`☁️  Uploaded to Cloudinary: ${uploadSuccess}`);
    console.log(`❌ Failed: ${failed}\n`);
    
    // Save electronics mapping
    fs.writeFileSync(
      path.join(__dirname, 'electronics-only.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('💾 Saved to: electronics-only.json');
    console.log('\n✨ DONE! Now will generate 200 variants...\n');
    
    // Generate 200 variants
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 GENERATING 200 PRODUCT VARIANTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const variants = {
      colors: ['Đen', 'Trắng', 'Xanh Dương', 'Đỏ', 'Vàng', 'Xám', 'Hồng'],
      storage: ['64GB', '128GB', '256GB', '512GB', '1TB'],
      ram: ['4GB', '8GB', '12GB', '16GB']
    };
    
    const usdToVnd = (usd) => Math.round(usd * 24000 / 1000) * 1000;
    
    const allVariants = [];
    const variantsPerProduct = Math.ceil(200 / electronics.length); // ~5-6 variants mỗi product
    
    results.forEach((base, baseIndex) => {
      for (let v = 0; v < variantsPerProduct; v++) {
        if (allVariants.length >= 200) break;
        
        const color = variants.colors[v % variants.colors.length];
        const storage = base.category === 'smartphones' || base.category === 'laptops' 
          ? variants.storage[v % variants.storage.length]
          : '';
        const ram = base.category === 'laptops' 
          ? variants.ram[v % variants.ram.length]
          : '';
        
        const variantName = [
          base.title,
          color,
          storage,
          ram
        ].filter(Boolean).join(' ');
        
        const priceMultiplier = 1 + (v * 0.12);
        const price = Math.round(usdToVnd(base.price) * priceMultiplier / 1000) * 1000;
        const originalPrice = Math.round(price * 1.15 / 1000) * 1000;
        
        allVariants.push({
          name: variantName,
          brand: base.brand,
          price: price,
          originalPrice: originalPrice,
          category: base.category === 'smartphones' ? 'Điện thoại' :
                   base.category === 'laptops' ? 'Laptop' :
                   base.category === 'tablets' ? 'Máy tính bảng' : 'Phụ kiện',
          image: base.cloudinaryUrl || base.localPath,
          desc: base.description || base.title,
          stock: base.stock || (50 + Math.floor(Math.random() * 50)),
          rating: base.rating || (4 + Math.floor(Math.random() * 2))
        });
      }
    });
    
    console.log(`✅ Generated ${allVariants.length} product variants\n`);
    
    // Save final 200 products
    fs.writeFileSync(
      path.join(__dirname, 'final-200-electronics.json'),
      JSON.stringify(allVariants, null, 2)
    );
    
    console.log('💾 Saved to: final-200-electronics.json');
    console.log(`📦 Total: ${allVariants.length} products`);
    console.log('\n✨ ALL DONE! Ready to update seed endpoint.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
