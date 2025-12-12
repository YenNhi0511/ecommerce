const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Cloudinary config
cloudinary.config({
  cloud_name: 'dcpfzg46o',
  api_key: '246635433286241',
  api_secret: 'it6LV29ghMqhQb_Sg6ojX2JEeZs'
});

// TẤT CẢ SẢN PHẨM từ DB - Organized by Category with IDs
const products = {
  smartphones: [
    { id: 1, name: 'iPhone 15 Pro Max', brand: 'Apple', search: 'iphone 15 pro max official product' },
    { id: 2, name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', search: 'samsung galaxy s24 ultra official' },
    { id: 3, name: 'iPhone 14 Pro', brand: 'Apple', search: 'iphone 14 pro official product' },
    { id: 4, name: 'Samsung Galaxy Z Fold5', brand: 'Samsung', search: 'samsung galaxy z fold5 official' },
    { id: 5, name: 'Xiaomi 14 Ultra', brand: 'Xiaomi', search: 'xiaomi 14 ultra official' },
    { id: 6, name: 'OPPO Find N3 Flip', brand: 'OPPO', search: 'oppo find n3 flip official' },
    { id: 7, name: 'iPhone 13', brand: 'Apple', search: 'iphone 13 official product' },
    { id: 8, name: 'Samsung Galaxy S23 FE', brand: 'Samsung', search: 'samsung galaxy s23 fe official' },
    { id: 9, name: 'Xiaomi Redmi Note 13 Pro', brand: 'Xiaomi', search: 'xiaomi redmi note 13 pro official' },
    { id: 10, name: 'OPPO Reno11 F 5G', brand: 'OPPO', search: 'oppo reno11 f 5g official' },
    { id: 11, name: 'Vivo V30 5G', brand: 'Vivo', search: 'vivo v30 5g official' },
    { id: 12, name: 'Realme 12 Pro+', brand: 'Realme', search: 'realme 12 pro plus official' }
  ],
  laptops: [
    { id: 1, name: 'MacBook Pro 14 M3', brand: 'Apple', search: 'macbook pro 14 m3 official' },
    { id: 2, name: 'Dell XPS 13 Plus', brand: 'Dell', search: 'dell xps 13 plus official' },
    { id: 3, name: 'ASUS ROG Strix G16', brand: 'ASUS', search: 'asus rog strix g16 official' },
    { id: 4, name: 'MSI Titan GT77 HX', brand: 'MSI', search: 'msi titan gt77 hx official' },
    { id: 5, name: 'Lenovo ThinkPad X1 Carbon Gen 11', brand: 'Lenovo', search: 'lenovo thinkpad x1 carbon gen 11 official' },
    { id: 6, name: 'HP Envy 13', brand: 'HP', search: 'hp envy 13 official' }
  ],
  tablets: [
    { id: 1, name: 'iPad Pro M2 11 inch', brand: 'Apple', search: 'ipad pro m2 11 inch official' },
    { id: 2, name: 'iPad Air 5 M1', brand: 'Apple', search: 'ipad air 5 m1 official' },
    { id: 3, name: 'Samsung Galaxy Tab S9 Ultra', brand: 'Samsung', search: 'samsung galaxy tab s9 ultra official' },
    { id: 4, name: 'Samsung Galaxy Tab S9 FE', brand: 'Samsung', search: 'samsung galaxy tab s9 fe official' },
    { id: 5, name: 'Xiaomi Pad 6', brand: 'Xiaomi', search: 'xiaomi pad 6 official' }
  ],
  accessories: [
    { id: 1, name: 'Apple AirPods Pro 2', brand: 'Apple', search: 'airpods pro 2 official' },
    { id: 2, name: 'Sony WH-1000XM5', brand: 'Sony', search: 'sony wh-1000xm5 official' },
    { id: 3, name: 'Anker 737 PowerCore', brand: 'Anker', search: 'anker 737 powercore official' },
    { id: 4, name: 'Logitech MX Master 3S', brand: 'Logitech', search: 'logitech mx master 3s official' },
    { id: 5, name: 'Apple Magic Mouse', brand: 'Apple', search: 'apple magic mouse official' },
    { id: 6, name: 'Logitech G Pro X Superlight', brand: 'Logitech', search: 'logitech g pro x superlight official' },
    { id: 7, name: 'Keychron K8 Pro', brand: 'Keychron', search: 'keychron k8 pro official' },
    { id: 8, name: 'Apple Magic Keyboard', brand: 'Apple', search: 'apple magic keyboard official' },
    { id: 9, name: 'Logitech MX Keys', brand: 'Logitech', search: 'logitech mx keys official' },
    { id: 10, name: 'Corsair K70 RGB Pro', brand: 'Corsair', search: 'corsair k70 rgb pro official' },
    { id: 11, name: 'Anker 737 GaN Prime', brand: 'Anker', search: 'anker 737 gan prime charger official' },
    { id: 12, name: 'Apple iPhone Case', brand: 'Apple', search: 'apple iphone 15 pro max case official' },
    { id: 13, name: 'Anker PowerLine III', brand: 'Anker', search: 'anker powerline iii usb-c cable official' },
    { id: 14, name: 'Baseus Gravity Phone Holder', brand: 'Baseus', search: 'baseus gravity phone holder official' }
  ]
};

// Curated professional image sources
const imageSources = {
  // Apple products - Use official Apple newsroom/product images
  apple: [
    'https://www.apple.com/newsroom/images/product/iphone/standard/Apple-iPhone-15-Pro-lineup-Color-Range-230912_big.jpg.large_2x.jpg',
    'https://www.apple.com/newsroom/images/product/mac/standard/Apple-MacBook-Pro-M3-hero-231030_big.jpg.large_2x.jpg',
    'https://www.apple.com/newsroom/images/product/ipad/standard/Apple-iPad-Pro-M2-hero-221018_big.jpg.large_2x.jpg',
    'https://www.apple.com/newsroom/images/product/airpods/standard/Apple-AirPods-Pro-2nd-gen-hero-220907_big.jpg.large_2x.jpg'
  ],
  // Fallback to high-quality Unsplash with specific product photography
  unsplash: {
    smartphones: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=95', // iPhone 15 Pro
      'https://images.unsplash.com/photo-1610945265078-d86fbc861f90?w=1200&q=95', // Samsung phone
      'https://images.unsplash.com/photo-1664478546384-d57ffe74a797?w=1200&q=95', // iPhone 14 Pro
      'https://images.unsplash.com/photo-1658428269781-a6c8f4989608?w=1200&q=95', // Foldable phone
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200&q=95', // Xiaomi
      'https://images.unsplash.com/photo-1627845348881-8b093273e2e5?w=1200&q=95', // Flip phone
      'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=1200&q=95', // iPhone 13
      'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b6?w=1200&q=95', // Samsung Galaxy
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=95', // Xiaomi Redmi
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=1200&q=95', // OPPO
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&q=95', // Vivo
      'https://images.unsplash.com/photo-1546194294-817db4e432df?w=1200&q=95'  // Realme
    ],
    laptops: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=95', // MacBook
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1200&q=95', // Dell XPS
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&q=95', // ASUS gaming
      'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=1200&q=95', // MSI gaming
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1200&q=95', // ThinkPad
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=95'  // HP Envy
    ],
    tablets: [
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=1200&q=95', // iPad Pro
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&q=95', // iPad Air
      'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=1200&q=95', // Galaxy Tab
      'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=1200&q=95', // Samsung tablet
      'https://images.unsplash.com/photo-1527698266440-12104e498b76?w=1200&q=95'  // Xiaomi Pad
    ],
    accessories: [
      'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=1200&q=95', // AirPods Pro
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200&q=95', // Sony headphones
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1200&q=95', // Power bank
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200&q=95', // Mouse
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1200&q=95', // Apple Mouse
      'https://images.unsplash.com/photo-1622457746212-c1473cb5ecc9?w=1200&q=95', // Gaming mouse
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=1200&q=95', // Mechanical keyboard
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&q=95', // Apple keyboard
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=1200&q=95', // Logitech keyboard
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=1200&q=95', // Corsair keyboard
      'https://images.unsplash.com/photo-1591290619762-d851d75d6d18?w=1200&q=95', // Charger
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1200&q=95', // Phone case
      'https://images.unsplash.com/photo-1572297794864-1d60f01ea9f0?w=1200&q=95', // USB cable
      'https://images.unsplash.com/photo-1580895423401-d53ad9e5e5b4?w=1200&q=95'  // Phone holder
    ]
  }
};

// Download with retry
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

// Upload to Cloudinary with retry
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

async function processAllProducts() {
  console.log('🎯 DOWNLOADING & UPLOADING PROFESSIONAL PRODUCT IMAGES\n');
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
  for (const [category, productList] of Object.entries(products)) {
    console.log(`\n📦 CATEGORY: ${category.toUpperCase()}`);
    console.log('─'.repeat(70));
    
    urlMapping[category] = {};
    
    for (let i = 0; i < productList.length; i++) {
      const product = productList[i];
      totalProcessed++;
      
      const publicId = `${category}-${product.id}`;
      const localFile = path.join(productsDir, `${publicId}.jpg`);
      
      console.log(`\n[${totalProcessed}/${37}] ${product.brand} ${product.name}`);
      console.log(`   🏷️  ID: ${publicId}`);
      
      try {
        // Get image URL from curated sources
        const imageUrl = imageSources.unsplash[category][i];
        
        if (!imageUrl) {
          throw new Error('No image URL available');
        }
        
        console.log(`   🌐 Source: Professional Stock`);
        
        // Download
        console.log(`   📥 Downloading...`);
        await downloadImage(imageUrl, localFile);
        console.log(`   ✅ Downloaded`);
        
        // Upload to Cloudinary
        console.log(`   ☁️  Uploading to Cloudinary...`);
        const cloudinaryUrl = await uploadToCloudinary(localFile, publicId);
        console.log(`   ✅ Uploaded: ${cloudinaryUrl.substring(0, 70)}...`);
        
        urlMapping[category][product.id] = cloudinaryUrl;
        totalSuccess++;
        
      } catch (error) {
        console.error(`   ❌ FAILED: ${error.message}`);
        totalFailed++;
        // Keep existing URL as fallback
        urlMapping[category][product.id] = null;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Save mapping
  const mappingFile = path.join(__dirname, 'cloudinary-mapping-complete.json');
  fs.writeFileSync(mappingFile, JSON.stringify(urlMapping, null, 2));
  
  console.log('\n\n' + '='.repeat(70));
  console.log('✅ PROCESS COMPLETE!');
  console.log('='.repeat(70));
  console.log(`📊 Total processed: ${totalProcessed}`);
  console.log(`✅ Successfully uploaded: ${totalSuccess}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📁 Images saved to: public/products/`);
  console.log(`🗺️  Mapping saved to: ${mappingFile}`);
  console.log('\n📋 Summary by category:');
  console.log(`   📱 Smartphones: ${products.smartphones.length} products`);
  console.log(`   💻 Laptops: ${products.laptops.length} products`);
  console.log(`   📲 Tablets: ${products.tablets.length} products`);
  console.log(`   🎧 Accessories: ${products.accessories.length} products`);
  console.log('\n🎯 Next: Run update-seed-with-cloudinary.js to update route.ts');
  
  return urlMapping;
}

// Run
processAllProducts()
  .then(() => console.log('\n🎉 All done!'))
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
