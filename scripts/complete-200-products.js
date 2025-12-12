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
  console.log('🚀 Fetching ALL 194 products from DummyJSON...\n');
  
  try {
    const allProducts = await fetchAllProducts();
    console.log(`✅ Fetched ${allProducts.length} products\n`);
    
    // Lấy đủ 200 products (tất cả categories)
    const toProcess = allProducts.slice(0, 200);
    console.log(`📦 Will download & upload ${toProcess.length} products\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 DOWNLOADING & UPLOADING TO CLOUDINARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const results = [];
    let downloadSuccess = 0;
    let uploadSuccess = 0;
    let failed = 0;
    
    for (let i = 0; i < toProcess.length; i++) {
      const product = toProcess[i];
      const imageUrl = product.thumbnail || product.images[0];
      const fileName = `product-${i + 1}.jpg`;
      const filePath = path.join(IMAGES_DIR, fileName);
      const publicId = `product-${i + 1}`;
      
      console.log(`[${i + 1}/${toProcess.length}] ${product.title}`);
      
      let cloudinaryUrl = null;
      
      // Download if not exists
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
        image: cloudinaryUrl || `/products/${fileName}`,
        cloudinaryUrl: cloudinaryUrl,
        localPath: `/products/${fileName}`
      });
      
      // Delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 FINAL SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📦 Total products: ${results.length}`);
    console.log(`📥 Downloaded: ${downloadSuccess}`);
    console.log(`☁️  Uploaded to Cloudinary: ${uploadSuccess}`);
    console.log(`❌ Failed: ${failed}\n`);
    
    // Save mapping
    fs.writeFileSync(
      path.join(__dirname, 'complete-products-200.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('💾 Saved to: complete-products-200.json');
    console.log('\n✨ DONE! Ready to update seed endpoint.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
