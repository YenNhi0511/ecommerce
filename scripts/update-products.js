// Script để test API update giá và hình ảnh sản phẩm
// Chạy lệnh: node scripts/update-products.js

const https = require('https');
const http = require('http');

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ json: () => Promise.resolve(result) });
        } catch (e) {
          resolve({ json: () => Promise.resolve({}) });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

const API_BASE = 'http://localhost:3001/api';

async function bulkUpdatePrices(category, multiplier) {
  try {
    const response = await fetch(`${API_BASE}/products/bulk-update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: category,
        priceMultiplier: multiplier,
      }),
    });

    const result = await response.json();
    console.log(`✅ Cập nhật giá hàng loạt ${category} x${multiplier}:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Lỗi cập nhật giá hàng loạt ${category}:`, error);
  }
}

async function updateProductImages(category) {
  try {
    const response = await fetch(`${API_BASE}/products/update-images`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: category,
        updateAll: !category,
      }),
    });

    const result = await response.json();
    console.log(`✅ Cập nhật hình ảnh ${category || 'tất cả'}:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Lỗi cập nhật hình ảnh ${category || 'tất cả'}:`, error);
  }
}

async function main() {
  console.log('🚀 Bắt đầu cập nhật sản phẩm...\n');

  // Cập nhật giá hàng loạt
  console.log('💰 Cập nhật giá hàng loạt:');
  await bulkUpdatePrices('Điện thoại', 1.1); // Tăng 10%
  await bulkUpdatePrices('Laptop', 1.05); // Tăng 5%
  await bulkUpdatePrices('Phụ kiện', 0.95); // Giảm 5%

  // Cập nhật hình ảnh
  console.log('\n🖼️  Cập nhật hình ảnh:');
  await updateProductImages('Điện thoại');
  await updateProductImages('Laptop');
  await updateProductImages('Máy tính bảng');
  await updateProductImages('Phụ kiện');

  console.log('\n✨ Hoàn thành cập nhật!');
}

main().catch(console.error);