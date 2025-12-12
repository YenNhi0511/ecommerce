const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { v2: cloudinary } = require('cloudinary');

// Cấu hình Cloudinary từ environment variables
cloudinary.config({
  cloud_name: 'dj0aanzfc',
  api_key: '989441175225613',
  api_secret: '1St5eoNrxkG9O_zHqZ9aBf6J54c',
});

// Folder lưu ảnh
const IMAGES_DIR = path.join(__dirname, '../public/product-images');

// Tạo folder nếu chưa tồn tại
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Danh sách sản phẩm với URLs (từ seed data)
const productImages = [
  // ĐIỆN THOẠI
  { id: 'DT001', name: 'iPhone 15 Pro Max', url: 'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg' },
  { id: 'DT002', name: 'Samsung Galaxy S24 Ultra', url: 'https://cdn.tgdd.vn/Products/Images/42/320721/samsung-galaxy-s24-ultra-grey-thumbnew-600x600.jpg' },
  { id: 'DT003', name: 'iPhone 14 Pro', url: 'https://cdn.tgdd.vn/Products/Images/42/289700/iphone-14-pro-vang-thumb-600x600.jpg' },
  { id: 'DT004', name: 'Samsung Galaxy Z Fold5', url: 'https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-z-fold5-kem-256gb-thumbnew-600x600.jpg' },
  { id: 'DT005', name: 'Xiaomi 14 Ultra', url: 'https://cdn.tgdd.vn/Products/Images/42/322096/xiaomi-14-ultra-black-thumbnew-600x600.jpg' },
  { id: 'DT006', name: 'OPPO Find N3 Flip', url: 'https://cdn.tgdd.vn/Products/Images/42/313220/oppo-find-n3-flip-pink-thumbnew-600x600.jpg' },
  { id: 'DT007', name: 'iPhone 13', url: 'https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pink-1-600x600.jpg' },
  { id: 'DT008', name: 'Samsung Galaxy S23 FE', url: 'https://cdn.tgdd.vn/Products/Images/42/316771/samsung-galaxy-s23-fe-xanh-thumbnew-600x600.jpg' },
  { id: 'DT009', name: 'Xiaomi Redmi Note 13 Pro', url: 'https://cdn.tgdd.vn/Products/Images/42/309816/xiaomi-redmi-note-13-pro-den-thumb-600x600.jpg' },
  { id: 'DT010', name: 'OPPO Reno11 F', url: 'https://cdn.tgdd.vn/Products/Images/42/320220/oppo-reno11-f-xanh-thumbnew-600x600.jpg' },
  { id: 'DT011', name: 'Vivo V30', url: 'https://cdn.tgdd.vn/Products/Images/42/322500/vivo-v30-xanh-thumbnew-600x600.jpg' },
  { id: 'DT012', name: 'Realme 12 Pro+', url: 'https://cdn.tgdd.vn/Products/Images/42/322550/realme-12-pro-plus-xanh-thumbnew-600x600.jpg' },
  
  // LAPTOP
  { id: 'LT001', name: 'MacBook Pro M3', url: 'https://cdn.tgdd.vn/Products/Images/44/322096/macbook-pro-14-m3-2023-xam-1.jpg' },
  { id: 'LT002', name: 'Dell XPS 15', url: 'https://cdn.tgdd.vn/Products/Images/44/307174/dell-xps-15-9530-i7-71003779-16gb-1tb-600x600.jpg' },
  { id: 'LT003', name: 'ASUS ROG Strix', url: 'https://cdn.tgdd.vn/Products/Images/44/316771/asus-rog-strix-g16-g614ju-i7-n4138w-thumb-600x600.jpg' },
  { id: 'LT004', name: 'Lenovo ThinkPad X1', url: 'https://cdn.tgdd.vn/Products/Images/44/309816/lenovo-thinkpad-x1-carbon-gen-11-i7-1365u-16gb-512gb-600x600.jpg' },
  { id: 'LT005', name: 'HP Pavilion 15', url: 'https://cdn.tgdd.vn/Products/Images/44/305658/hp-pavilion-15-eg2081tu-i5-6k795pa-thumb-600x600.jpg' },
  { id: 'LT006', name: 'MSI Gaming GF63', url: 'https://cdn.tgdd.vn/Products/Images/44/320721/msi-gaming-gf63-thin-11uc-i5-444vn-thumb-600x600.jpg' },
  
  // TABLET
  { id: 'TB001', name: 'iPad Air 5', url: 'https://cdn.tgdd.vn/Products/Images/522/325515/ipad-air-5-wifi-64gb-2022-hong-thumb-600x600.jpg' },
  { id: 'TB002', name: 'Samsung Galaxy Tab S9', url: 'https://cdn.tgdd.vn/Products/Images/522/307174/samsung-galaxy-tab-s9-fe-wifi-gray-thumb-600x600.jpg' },
  { id: 'TB003', name: 'iPad Pro M2', url: 'https://cdn.tgdd.vn/Products/Images/522/289700/ipad-pro-129-inch-wifi-128gb-2022-xam-thumb-600x600.jpg' },
  { id: 'TB004', name: 'iPad Mini 6', url: 'https://cdn.tgdd.vn/Products/Images/522/230529/ipad-mini-6-wifi-64gb-2021-hong-thumb-600x600.jpg' },
  { id: 'TB005', name: 'Samsung Galaxy Tab A9', url: 'https://cdn.tgdd.vn/Products/Images/522/316771/samsung-galaxy-tab-a9-plus-wifi-gray-thumb-600x600.jpg' },
  
  // PHỤ KIỆN
  { id: 'PK001', name: 'AirPods Pro 2', url: 'https://cdn.tgdd.vn/Products/Images/54/289700/tai-nghe-bluetooth-airpods-pro-2-usb-c-apple-thumb-600x600.jpg' },
  { id: 'PK002', name: 'Apple Watch Series 9', url: 'https://cdn.tgdd.vn/Products/Images/7077/322096/apple-watch-s9-gps-41mm-vien-nhom-day-cao-su-thumb-600x600.jpg' },
  { id: 'PK003', name: 'Samsung Galaxy Buds2 Pro', url: 'https://cdn.tgdd.vn/Products/Images/54/307174/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds2-pro-r510-thumb-600x600.jpg' },
  { id: 'PK004', name: 'Apple Pencil 2', url: 'https://cdn.tgdd.vn/Products/Images/1925/230529/but-cam-ung-apple-pencil-2-thumb-600x600.jpg' },
  { id: 'PK005', name: 'Sạc Anker 65W', url: 'https://cdn.tgdd.vn/Products/Images/58/305658/sac-anker-65w-3-cong-usb-c-737-a2148-thumb-600x600.jpg' },
  { id: 'PK006', name: 'Ốp lưng iPhone 15', url: 'https://cdn.tgdd.vn/Products/Images/60/320721/op-lung-iphone-15-pro-max-silicone-magsafe-thumb-600x600.jpg' },
  { id: 'PK007', name: 'Chuột Logitech MX Master', url: 'https://cdn.tgdd.vn/Products/Images/86/316771/chuot-khong-day-logitech-mx-master-3s-thumb-600x600.jpg' },
  { id: 'PK008', name: 'Bàn phím Magic Keyboard', url: 'https://cdn.tgdd.vn/Products/Images/4547/322500/ban-phim-bluetooth-apple-magic-keyboard-mk2a3-thumb-600x600.jpg' },
];

// Hàm download file
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filePath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filePath);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        file.close();
        fs.unlinkSync(filePath);
        downloadFile(response.headers.location, filePath).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlinkSync(filePath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      reject(err);
    });
  });
}

// Hàm upload lên Cloudinary
async function uploadToCloudinary(filePath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'tmdt_ecommerce',
      public_id: publicId,
      overwrite: true,
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Upload failed for ${publicId}:`, error.message);
    return null;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting download and upload process...\n');
  
  const results = [];
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < productImages.length; i++) {
    const item = productImages[i];
    const fileName = `${item.id}.jpg`;
    const filePath = path.join(IMAGES_DIR, fileName);
    
    console.log(`\n[${i + 1}/${productImages.length}] Processing: ${item.name} (${item.id})`);
    
    try {
      // Download
      console.log(`  📥 Downloading...`);
      await downloadFile(item.url, filePath);
      console.log(`  ✅ Downloaded to ${fileName}`);
      
      // Upload to Cloudinary
      console.log(`  ☁️  Uploading to Cloudinary...`);
      const cloudinaryUrl = await uploadToCloudinary(filePath, item.id);
      
      if (cloudinaryUrl) {
        console.log(`  ✅ Uploaded: ${cloudinaryUrl}`);
        results.push({ id: item.id, name: item.name, url: cloudinaryUrl });
        successCount++;
      } else {
        console.log(`  ❌ Upload failed`);
        failCount++;
      }
      
      // Delay để tránh rate limit
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      failCount++;
    }
  }
  
  console.log('\n\n📊 Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📁 Total: ${productImages.length}`);
  
  // Save mapping to JSON
  const mappingPath = path.join(__dirname, 'cloudinary-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Saved URL mapping to: ${mappingPath}`);
  console.log('\n✨ Done!');
}

main().catch(console.error);
