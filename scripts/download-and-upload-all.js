const fs = require('fs');
const path = require('path');
const https = require('https');
const { v2: cloudinary } = require('cloudinary');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: 'dcpfzg46o',
  api_key: '246635433286241',
  api_secret: 'it6LV29ghMqhQb_Sg6ojX2JEeZs',
});

const IMAGES_DIR = path.join(__dirname, '../public/products');

// Tạo folder
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Fetch tất cả products từ DummyJSON
async function fetchAllProducts() {
  return new Promise((resolve, reject) => {
    https.get('https://dummyjson.com/products?limit=0', (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
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

// Download ảnh
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
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
      reject(new Error('Download timeout'));
    });
  });
}

// Upload lên Cloudinary với retry
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
      if (i === retries - 1) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Main
async function main() {
  console.log('🚀 Fetching ALL products from DummyJSON...\n');
  
  try {
    const allProducts = await fetchAllProducts();
    console.log(`✅ Fetched ${allProducts.length} products total\n`);
    
    // Lọc theo category phù hợp
    const electronics = allProducts.filter(p => 
      ['smartphones', 'laptops', 'tablets', 'mobile-accessories'].includes(p.category)
    );
    
    console.log(`📱 Electronics products: ${electronics.length}`);
    console.log(`📊 Will process first 200 products\n`);
    
    const toProcess = electronics.slice(0, 200);
    
    // Phase 1: Download tất cả ảnh
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 PHASE 1: DOWNLOADING IMAGES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const downloadResults = [];
    let downloadSuccess = 0;
    let downloadFail = 0;
    
    for (let i = 0; i < toProcess.length; i++) {
      const product = toProcess[i];
      const imageUrl = product.thumbnail || product.images[0];
      const fileName = `product-${i + 1}.jpg`;
      const filePath = path.join(IMAGES_DIR, fileName);
      
      console.log(`[${i + 1}/${toProcess.length}] ${product.title}`);
      
      // Skip if exists
      if (fs.existsSync(filePath)) {
        console.log(`  ⏭️  Already downloaded`);
        downloadResults.push({
          index: i + 1,
          product,
          fileName,
          filePath,
          localPath: `/products/${fileName}`,
          downloaded: true,
          uploaded: false
        });
        downloadSuccess++;
        continue;
      }
      
      try {
        await downloadImage(imageUrl, filePath);
        const stats = fs.statSync(filePath);
        console.log(`  ✅ Downloaded (${(stats.size / 1024).toFixed(1)} KB)`);
        
        downloadResults.push({
          index: i + 1,
          product,
          fileName,
          filePath,
          localPath: `/products/${fileName}`,
          downloaded: true,
          uploaded: false
        });
        downloadSuccess++;
        
        await new Promise(resolve => setTimeout(resolve, 150));
      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}`);
        downloadFail++;
      }
    }
    
    console.log('\n📊 Download Summary:');
    console.log(`  ✅ Success: ${downloadSuccess}/${toProcess.length}`);
    console.log(`  ❌ Failed: ${downloadFail}/${toProcess.length}`);
    
    // Phase 2: Upload lên Cloudinary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('☁️  PHASE 2: UPLOADING TO CLOUDINARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🔍 Testing Cloudinary connection first...');
    
    // Test upload
    try {
      const testResult = await uploadToCloudinary(
        downloadResults[0].filePath, 
        'test-' + Date.now()
      );
      console.log('✅ Cloudinary connection OK!\n');
    } catch (error) {
      console.error('❌ Cloudinary test failed:', error.message);
      console.error('\n⚠️  CLOUDINARY NOT WORKING!');
      console.error('Possible issues:');
      console.error('  1. Network/Firewall blocking Cloudinary API');
      console.error('  2. Invalid credentials');
      console.error('  3. Account quota exceeded\n');
      console.error('💡 Will save mapping with LOCAL paths only.\n');
      
      // Save với local paths
      const mapping = downloadResults.map(r => ({
        id: `product-${r.index}`,
        title: r.product.title,
        brand: r.product.brand,
        price: r.product.price,
        category: r.product.category,
        image: r.localPath,
        cloudinaryUrl: null,
        localPath: r.localPath
      }));
      
      fs.writeFileSync(
        path.join(__dirname, 'all-products-mapping.json'),
        JSON.stringify(mapping, null, 2)
      );
      
      console.log('✅ Saved mapping to: all-products-mapping.json');
      console.log('📦 Total products:', mapping.length);
      console.log('\n💡 You can use local images: /products/product-1.jpg, etc.');
      return;
    }
    
    // Upload tất cả
    let uploadSuccess = 0;
    let uploadFail = 0;
    
    for (let i = 0; i < downloadResults.length; i++) {
      const item = downloadResults[i];
      console.log(`[${i + 1}/${downloadResults.length}] Uploading ${item.fileName}...`);
      
      try {
        const cloudinaryUrl = await uploadToCloudinary(
          item.filePath,
          `product-${item.index}`
        );
        console.log(`  ✅ Uploaded: ${cloudinaryUrl}`);
        
        item.cloudinaryUrl = cloudinaryUrl;
        item.uploaded = true;
        uploadSuccess++;
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`  ❌ Upload failed: ${error.message}`);
        uploadFail++;
      }
    }
    
    console.log('\n📊 Upload Summary:');
    console.log(`  ✅ Success: ${uploadSuccess}/${downloadResults.length}`);
    console.log(`  ❌ Failed: ${uploadFail}/${downloadResults.length}`);
    
    // Save final mapping
    const finalMapping = downloadResults.map(r => ({
      id: `product-${r.index}`,
      title: r.product.title,
      brand: r.product.brand,
      price: r.product.price,
      category: r.product.category,
      image: r.cloudinaryUrl || r.localPath,
      cloudinaryUrl: r.cloudinaryUrl,
      localPath: r.localPath
    }));
    
    fs.writeFileSync(
      path.join(__dirname, 'all-products-mapping.json'),
      JSON.stringify(finalMapping, null, 2)
    );
    
    console.log('\n💾 Saved final mapping to: all-products-mapping.json');
    console.log('📦 Total products:', finalMapping.length);
    console.log('\n✨ DONE!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
