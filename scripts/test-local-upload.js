const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: 'dcpfzg46o',
  api_key: '246635433286241',
  api_secret: 'it6LV29ghMqhQb_Sg6ojX2JEeZs',
});

// Tạo folder test
const testDir = path.join(__dirname, '../public/test-images');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

console.log('🧪 Testing Cloudinary Upload with Local File...\n');

// Tạo một file ảnh test đơn giản (1x1 pixel PNG)
const testImagePath = path.join(testDir, 'test.png');
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
fs.writeFileSync(testImagePath, Buffer.from(pngBase64, 'base64'));
console.log('✅ Created test image:', testImagePath);

// Test upload file local với timeout dài hơn
console.log('\n📤 Uploading test image...');

cloudinary.uploader.upload(
  testImagePath,
  {
    folder: 'tmdt_ecommerce',
    public_id: 'test-local-' + Date.now(),
    resource_type: 'image',
    timeout: 60000, // 60 seconds timeout
  }
)
  .then(result => {
    console.log('✅ Upload SUCCESS!');
    console.log('  - URL:', result.secure_url);
    console.log('  - Public ID:', result.public_id);
    console.log('\n✨ Cloudinary upload from local file works!');
    console.log('\n💡 Now we can proceed with bulk upload.');
    
    // Clean up
    fs.unlinkSync(testImagePath);
  })
  .catch(error => {
    console.error('❌ Upload FAILED!');
    console.error('Full error object:', error);
    
    if (error.error) {
      console.error('\n📋 Error details:');
      console.error('  - Message:', error.error.message);
      console.error('  - HTTP Code:', error.error.http_code);
      console.error('  - Name:', error.error.name);
    }
    
    if (error.message) {
      console.error('\n💬 Error message:', error.message);
    }
    
    // Suggestions
    console.error('\n💡 Troubleshooting suggestions:');
    console.error('  1. Check your internet connection');
    console.error('  2. Verify Cloudinary account is active');
    console.error('  3. Try again after a few minutes');
    console.error('  4. Check if firewall/antivirus is blocking the connection');
  });
