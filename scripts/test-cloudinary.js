const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

// Cấu hình Cloudinary với credentials ĐÚNG từ .env
cloudinary.config({
  cloud_name: 'dcpfzg46o',
  api_key: '246635433286241',
  api_secret: 'it6LV29ghMqhQb_Sg6ojX2JEeZs',
});

console.log('🔍 Testing Cloudinary Configuration...\n');

// Test 1: Kiểm tra config
console.log('✅ Config loaded:');
console.log('  - Cloud Name:', cloudinary.config().cloud_name);
console.log('  - API Key:', cloudinary.config().api_key);
console.log('  - API Secret:', cloudinary.config().api_secret ? '***' + cloudinary.config().api_secret.slice(-4) : 'Not set');

// Test 2: Upload từ URL (không cần download)
console.log('\n📤 Test Upload from URL...');
cloudinary.uploader.upload(
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop',
  {
    folder: 'tmdt_ecommerce',
    public_id: 'test-upload-' + Date.now(),
    resource_type: 'image',
  }
)
  .then(result => {
    console.log('✅ Upload SUCCESS!');
    console.log('  - URL:', result.secure_url);
    console.log('  - Public ID:', result.public_id);
    console.log('  - Format:', result.format);
    console.log('  - Size:', result.bytes, 'bytes');
    console.log('\n✨ Cloudinary is working correctly!');
  })
  .catch(error => {
    console.error('❌ Upload FAILED!');
    console.error('Error details:', JSON.stringify(error, null, 2));
    if (error.error) {
      console.error('\nCloudinary Error:', error.error.message || error.error);
    }
    if (error.http_code) {
      console.error('HTTP Code:', error.http_code);
    }
  });
