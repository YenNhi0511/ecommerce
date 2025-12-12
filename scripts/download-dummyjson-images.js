const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dcpfzg46o',
  api_key: '246635433286241',
  api_secret: 'it6LV29ghMqhQb_Sg6ojX2JEeZs'
});

// Map sản phẩm DB với DummyJSON products (ĐÚNG categories điện tử)
const productMapping = {
  smartphones: [
    { id: 1, name: 'iPhone 15 Pro Max 256GB', dummyId: 123, dummyName: 'iPhone 13 Pro' },
    { id: 2, name: 'Samsung Galaxy S24 Ultra', dummyId: 133, dummyName: 'Samsung Galaxy S10' },
    { id: 3, name: 'iPhone 14 Pro 128GB', dummyId: 124, dummyName: 'iPhone X' },
    { id: 4, name: 'Samsung Galaxy Z Fold5', dummyId: 132, dummyName: 'Samsung Galaxy S8' },
    { id: 5, name: 'Xiaomi 14 Ultra', dummyId: 130, dummyName: 'Realme XT' },
    { id: 6, name: 'OPPO Find N3 Flip', dummyId: 126, dummyName: 'Oppo F19 Pro Plus' },
    { id: 7, name: 'iPhone 13 128GB', dummyId: 122, dummyName: 'iPhone 6' },
    { id: 8, name: 'Samsung Galaxy S23 FE', dummyId: 131, dummyName: 'Samsung Galaxy S7' },
    { id: 9, name: 'Xiaomi Redmi Note 13 Pro', dummyId: 128, dummyName: 'Realme C35' },
    { id: 10, name: 'OPPO Reno11 F 5G', dummyId: 125, dummyName: 'Oppo A57' },
    { id: 11, name: 'Vivo V30 5G', dummyId: 135, dummyName: 'Vivo V9' },
    { id: 12, name: 'Realme 12 Pro+', dummyId: 129, dummyName: 'Realme X' }
  ],
  laptops: [
    { id: 1, name: 'MacBook Pro 14 M3 Pro', dummyId: 78, dummyName: 'Apple MacBook Pro 14 Inch Space Grey' },
    { id: 2, name: 'Dell XPS 13 Plus', dummyId: 82, dummyName: 'New DELL XPS 13 9300 Laptop' },
    { id: 3, name: 'ASUS ROG Strix G16', dummyId: 79, dummyName: 'Asus Zenbook Pro Dual Screen Laptop' },
    { id: 4, name: 'MSI Titan GT77 HX', dummyId: 79, dummyName: 'Asus Zenbook Pro' },
    { id: 5, name: 'Lenovo ThinkPad X1 Carbon', dummyId: 81, dummyName: 'Lenovo Yoga 920' },
    { id: 6, name: 'HP Envy 13', dummyId: 80, dummyName: 'Huawei Matebook X Pro' }
  ],
  tablets: [
    { id: 1, name: 'iPad Pro M2 11 inch', dummyId: 159, dummyName: 'iPad Mini 2021 Starlight' },
    { id: 2, name: 'iPad Air 5 M1', dummyId: 159, dummyName: 'iPad Mini 2021 Starlight' },
    { id: 3, name: 'Samsung Galaxy Tab S9 Ultra', dummyId: 160, dummyName: 'Samsung Galaxy Tab S8 Plus Grey' },
    { id: 4, name: 'Samsung Galaxy Tab S9 FE', dummyId: 161, dummyName: 'Samsung Galaxy Tab White' },
    { id: 5, name: 'Xiaomi Pad 6', dummyId: 160, dummyName: 'Samsung Galaxy Tab S8 Plus Grey' }
  ],
  accessories: [
    { id: 1, name: 'Apple AirPods Pro 2', dummyId: 100, dummyName: 'Apple Airpods' },
    { id: 2, name: 'Sony WH-1000XM5', dummyId: 107, dummyName: 'Beats Flex Wireless Earphones' },
    { id: 3, name: 'Anker PowerCore', dummyId: 105, dummyName: 'Apple MagSafe Battery Pack' },
    { id: 4, name: 'Logitech MX Master 3S', dummyId: 109, dummyName: 'Monopod' },
    { id: 5, name: 'Apple Magic Mouse', dummyId: 110, dummyName: 'Selfie Lamp with iPhone' },
    { id: 6, name: 'Logitech G Pro X Superlight', dummyId: 109, dummyName: 'Monopod' },
    { id: 7, name: 'Keychron K8 Pro', dummyId: 106, dummyName: 'Apple Watch Series 4 Gold' },
    { id: 8, name: 'Apple Magic Keyboard', dummyId: 103, dummyName: 'Apple HomePod Mini Cosmic Grey' },
    { id: 9, name: 'Logitech MX Keys', dummyId: 99, dummyName: 'Amazon Echo Plus' },
    { id: 10, name: 'Corsair K70 RGB Pro', dummyId: 106, dummyName: 'Apple Watch Series 4 Gold' },
    { id: 11, name: 'Anker GaN Charger', dummyId: 104, dummyName: 'Apple iPhone Charger' },
    { id: 12, name: 'iPhone Case', dummyId: 108, dummyName: 'iPhone 12 Silicone Case with MagSafe Plum' },
    { id: 13, name: 'Anker PowerLine Cable', dummyId: 104, dummyName: 'Apple iPhone Charger' },
    { id: 14, name: 'Baseus Phone Holder', dummyId: 111, dummyName: 'Selfie Stick Monopod' }
  ]
};

// Download image
async function downloadImage(url, filePath, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      
      return true;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Upload to Cloudinary
async function uploadToCloudinary(filePath, publicId, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'tmdt_ecommerce',
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        timeout: 60000
      });
      return result.secure_url;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Get product from DummyJSON
async function getProductImage(productId) {
  try {
    const response = await axios.get(`https://dummyjson.com/products/${productId}`);
    return response.data.thumbnail || response.data.images[0];
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error.message);
    return null;
  }
}

async function processAllProducts() {
  console.log('🎯 DOWNLOADING REAL PRODUCT IMAGES FROM DUMMYJSON\n');
  console.log('=' .repeat(70));
  
  const productsDir = path.join(__dirname, '../public/products');
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
  }

  const urlMapping = {};
  let totalProcessed = 0;
  let totalSuccess = 0;
  let totalFailed = 0;

  // Process each category
  for (const [category, products] of Object.entries(productMapping)) {
    console.log(`\n📦 ${category.toUpperCase()}`);
    console.log('─'.repeat(70));
    
    urlMapping[category] = {};
    
    for (const product of products) {
      totalProcessed++;
      const publicId = `${category}-${product.id}`;
      const localFile = path.join(productsDir, `${publicId}.jpg`);
      
      console.log(`\n[${totalProcessed}/37] ${product.name}`);
      console.log(`   🆔 ID: ${publicId}`);
      console.log(`   🔗 DummyJSON Product #${product.dummyId}: ${product.dummyName}`);
      
      try {
        // Get image URL from DummyJSON
        console.log(`   🌐 Fetching from DummyJSON API...`);
        const imageUrl = await getProductImage(product.dummyId);
        
        if (!imageUrl) {
          throw new Error('No image URL found');
        }
        
        console.log(`   📥 Downloading: ${imageUrl.substring(0, 60)}...`);
        await downloadImage(imageUrl, localFile);
        console.log(`   ✅ Downloaded to: ${publicId}.jpg`);
        
        // Upload to Cloudinary
        console.log(`   ☁️  Uploading to Cloudinary...`);
        const cloudinaryUrl = await uploadToCloudinary(localFile, publicId);
        console.log(`   ✅ Cloudinary: ${cloudinaryUrl.substring(0, 70)}...`);
        
        urlMapping[category][product.id] = cloudinaryUrl;
        totalSuccess++;
        
      } catch (error) {
        console.error(`   ❌ FAILED: ${error.message}`);
        totalFailed++;
        urlMapping[category][product.id] = null;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Save mapping
  const mappingFile = path.join(__dirname, 'dummyjson-cloudinary-mapping.json');
  fs.writeFileSync(mappingFile, JSON.stringify(urlMapping, null, 2));
  
  console.log('\n\n' + '='.repeat(70));
  console.log('✅ PROCESS COMPLETE!');
  console.log('='.repeat(70));
  console.log(`📊 Total: ${totalProcessed} products`);
  console.log(`✅ Success: ${totalSuccess}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📁 Images: public/products/`);
  console.log(`🗺️  Mapping: ${mappingFile}`);
  console.log('\n📋 By Category:');
  console.log(`   📱 Smartphones: ${productMapping.smartphones.length}`);
  console.log(`   💻 Laptops: ${productMapping.laptops.length}`);
  console.log(`   📲 Tablets: ${productMapping.tablets.length}`);
  console.log(`   🎧 Accessories: ${productMapping.accessories.length}`);
  console.log('\n🎯 Next: Run update-route-dummyjson.js');
  
  return urlMapping;
}

// Run
processAllProducts()
  .then(() => console.log('\n🎉 Done!'))
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
