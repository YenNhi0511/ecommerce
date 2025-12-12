const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dcpfzg46o',
  api_key: '246635433286241',
  api_secret: 'it6LV29ghMqhQb_Sg6ojX2JEeZs'
});

// Hình ảnh accessories từ Unsplash (professional, high-quality)
const accessoriesImages = {
  1: { // AirPods Pro 2
    name: 'Apple AirPods Pro 2',
    url: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&auto=format'
  },
  2: { // Sony WH-1000XM5
    name: 'Sony WH-1000XM5',
    url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format'
  },
  3: { // Anker PowerCore
    name: 'Anker PowerCore',
    url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format'
  },
  4: { // Logitech MX Master 3S
    name: 'Logitech MX Master 3S',
    url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&auto=format'
  },
  5: { // Apple Magic Mouse
    name: 'Apple Magic Mouse',
    url: 'https://images.unsplash.com/photo-1615750185825-9e5e7e315f3f?w=800&auto=format'
  },
  6: { // Logitech G Pro X Superlight
    name: 'Logitech G Pro X Superlight',
    url: 'https://images.unsplash.com/photo-1563297007-0686b7003af7?w=800&auto=format'
  },
  7: { // Keychron K8 Pro
    name: 'Keychron K8 Pro',
    url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format'
  },
  8: { // Apple Magic Keyboard
    name: 'Apple Magic Keyboard',
    url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format'
  },
  9: { // Logitech MX Keys
    name: 'Logitech MX Keys',
    url: 'https://images.unsplash.com/photo-1560762484-813fc97650a0?w=800&auto=format'
  },
  10: { // Corsair K70 RGB Pro
    name: 'Corsair K70 RGB Pro',
    url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&auto=format'
  },
  11: { // Anker GaN Charger
    name: 'Anker GaN Charger',
    url: 'https://images.unsplash.com/photo-1591290619762-5f5f89e84b8a?w=800&auto=format'
  },
  12: { // iPhone Case
    name: 'iPhone Case',
    url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format'
  },
  13: { // Anker PowerLine Cable
    name: 'Anker PowerLine Cable',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format'
  },
  14: { // Baseus Phone Holder
    name: 'Baseus Phone Holder',
    url: 'https://images.unsplash.com/photo-1609703039796-ccf209ae9452?w=800&auto=format'
  }
};

async function downloadImage(url, filePath, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { 
        responseType: 'arraybuffer',
        timeout: 30000
      });
      fs.writeFileSync(filePath, response.data);
      return true;
    } catch (error) {
      console.log(`   ⚠️  Retry ${i + 1}/${retries}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

async function uploadToCloudinary(filePath, publicId, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        folder: 'tmdt_ecommerce',
        overwrite: true,
        resource_type: 'image',
        timeout: 60000
      });
      return result.secure_url;
    } catch (error) {
      console.log(`   ⚠️  Upload retry ${i + 1}/${retries}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return null;
}

async function fixAccessories() {
  console.log('🔧 FIXING ACCESSORIES IMAGES');
  console.log('══════════════════════════════════════════════════\n');

  const publicDir = path.join(__dirname, '../public/products');
  const mapping = {};

  for (const [id, data] of Object.entries(accessoriesImages)) {
    const filename = `accessories-${id}.jpg`;
    const filePath = path.join(publicDir, filename);
    const publicId = `accessories-${id}`;

    console.log(`[${id}/14] ${data.name}`);
    console.log(`   🔗 URL: ${data.url}`);
    
    // Download
    console.log(`   📥 Downloading...`);
    const downloaded = await downloadImage(data.url, filePath);
    
    if (!downloaded) {
      console.log(`   ❌ FAILED to download\n`);
      continue;
    }
    
    console.log(`   ✅ Downloaded`);
    
    // Upload to Cloudinary
    console.log(`   ☁️  Uploading to Cloudinary...`);
    const cloudinaryUrl = await uploadToCloudinary(filePath, publicId);
    
    if (!cloudinaryUrl) {
      console.log(`   ❌ FAILED to upload\n`);
      continue;
    }
    
    console.log(`   ✅ Cloudinary: ${cloudinaryUrl}\n`);
    mapping[id] = cloudinaryUrl;
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Save mapping
  const mappingPath = path.join(__dirname, 'accessories-cloudinary-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify({ accessories: mapping }, null, 2));
  
  console.log('══════════════════════════════════════════════════');
  console.log(`✅ Fixed ${Object.keys(mapping).length}/14 accessories`);
  console.log(`🗺️  Mapping: ${mappingPath}`);
}

fixAccessories().catch(console.error);
