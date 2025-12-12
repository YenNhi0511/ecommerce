const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dcpfzg46o',
  api_key: '246635433286241',
  api_secret: 'it6LV29ghMqhQb_Sg6ojX2JEeZs'
});

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

async function uploadAllImages() {
  console.log('📤 UPLOADING ALL IMAGES TO CLOUDINARY');
  console.log('══════════════════════════════════════════════════\n');

  const publicDir = path.join(__dirname, '../public/products');
  const files = fs.readdirSync(publicDir).filter(f => 
    f.endsWith('.jpg') || f.endsWith('.webp') || f.endsWith('.png')
  );

  const mapping = {
    smartphones: {},
    laptops: {},
    tablets: {},
    accessories: {}
  };

  let uploaded = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(publicDir, file);
    const publicId = file.replace(/\.(jpg|webp|png)$/i, '');
    
    // Determine category
    let category = null;
    if (publicId.startsWith('smartphones-')) category = 'smartphones';
    else if (publicId.startsWith('laptops-')) category = 'laptops';
    else if (publicId.startsWith('tablets-')) category = 'tablets';
    else if (publicId.startsWith('accessories-')) category = 'accessories';
    
    if (!category) {
      console.log(`⏭️  Skipping ${file} (unknown category)\n`);
      continue;
    }

    const id = publicId.split('-')[1];
    
    console.log(`📤 [${uploaded + failed + 1}/${files.length}] ${file}`);
    console.log(`   🆔 Public ID: ${publicId}`);
    console.log(`   ☁️  Uploading...`);
    
    const cloudinaryUrl = await uploadToCloudinary(filePath, publicId);
    
    if (cloudinaryUrl) {
      console.log(`   ✅ Success: ${cloudinaryUrl}\n`);
      mapping[category][id] = cloudinaryUrl;
      uploaded++;
    } else {
      console.log(`   ❌ Failed\n`);
      failed++;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Save mapping
  const mappingPath = path.join(__dirname, 'all-cloudinary-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  
  console.log('══════════════════════════════════════════════════');
  console.log(`✅ Uploaded: ${uploaded}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🗺️  Mapping saved: ${mappingPath}`);
}

uploadAllImages().catch(console.error);
