const fs = require('fs');
const path = require('path');

// Đọc mapping
const mapping = JSON.parse(fs.readFileSync(path.join(__dirname, 'product-mapping.json'), 'utf8'));

// Phân loại
const phones = mapping.filter(p => p.id.startsWith('phone-'));
const laptops = mapping.filter(p => p.id.startsWith('laptop-'));
const tablets = mapping.filter(p => p.id.startsWith('tablet-'));
const accessories = mapping.filter(p => p.id.startsWith('accessory-'));

// Convert USD sang VND (tỷ giá ~24,000)
const usdToVnd = (usd) => Math.round(usd * 24000 / 1000) * 1000;

// Generate seed data
const generateSeedCode = () => {
  let code = `// ĐIỆN THOẠI (${phones.length} products)\nconst smartphones = [\n`;
  
  phones.forEach((p, i) => {
    const price = usdToVnd(p.price);
    const originalPrice = Math.round(price * 1.15 / 1000) * 1000;
    code += `  {\n`;
    code += `    name: '${p.title}',\n`;
    code += `    brand: '${p.brand}',\n`;
    code += `    price: ${price},\n`;
    code += `    originalPrice: ${originalPrice},\n`;
    code += `    category: 'Điện thoại',\n`;
    code += `    image: '${p.localPath}',\n`;
    code += `    desc: '${p.title} - Sản phẩm chính hãng với thiết kế cao cấp và hiệu năng mạnh mẽ',\n`;
    code += `    stock: ${50 + Math.floor(Math.random() * 50)},\n`;
    code += `    rating: ${4 + Math.floor(Math.random() * 2)}\n`;
    code += `  }${i < phones.length - 1 ? ',' : ''}\n`;
  });
  
  code += `];\n\n`;
  code += `// LAPTOP (${laptops.length} products)\nconst laptops = [\n`;
  
  laptops.forEach((p, i) => {
    const price = usdToVnd(p.price);
    const originalPrice = Math.round(price * 1.1 / 1000) * 1000;
    code += `  {\n`;
    code += `    name: '${p.title}',\n`;
    code += `    brand: '${p.brand}',\n`;
    code += `    price: ${price},\n`;
    code += `    originalPrice: ${originalPrice},\n`;
    code += `    category: 'Laptop',\n`;
    code += `    image: '${p.localPath}',\n`;
    code += `    desc: '${p.title} - Laptop cao cấp với hiệu năng vượt trội, thiết kế sang trọng',\n`;
    code += `    stock: ${20 + Math.floor(Math.random() * 30)},\n`;
    code += `    rating: 5\n`;
    code += `  }${i < laptops.length - 1 ? ',' : ''}\n`;
  });
  
  code += `];\n\n`;
  code += `// TABLET (${tablets.length} products)\nconst tablets = [\n`;
  
  tablets.forEach((p, i) => {
    const price = usdToVnd(p.price);
    const originalPrice = Math.round(price * 1.12 / 1000) * 1000;
    code += `  {\n`;
    code += `    name: '${p.title}',\n`;
    code += `    brand: '${p.brand}',\n`;
    code += `    price: ${price},\n`;
    code += `    originalPrice: ${originalPrice},\n`;
    code += `    category: 'Máy tính bảng',\n`;
    code += `    image: '${p.localPath}',\n`;
    code += `    desc: '${p.title} - Máy tính bảng hiện đại với màn hình lớn và pin trâu',\n`;
    code += `    stock: ${30 + Math.floor(Math.random() * 40)},\n`;
    code += `    rating: ${4 + Math.floor(Math.random() * 2)}\n`;
    code += `  }${i < tablets.length - 1 ? ',' : ''}\n`;
  });
  
  code += `];\n\n`;
  code += `// PHỤ KIỆN (${accessories.length} products)\nconst accessories = [\n`;
  
  accessories.forEach((p, i) => {
    const price = usdToVnd(p.price);
    const originalPrice = Math.round(price * 1.2 / 1000) * 1000;
    code += `  {\n`;
    code += `    name: '${p.title}',\n`;
    code += `    brand: '${p.brand}',\n`;
    code += `    price: ${price},\n`;
    code += `    originalPrice: ${originalPrice},\n`;
    code += `    category: 'Phụ kiện',\n`;
    code += `    image: '${p.localPath}',\n`;
    code += `    desc: '${p.title} - Phụ kiện chất lượng cao, thiết kế tinh tế',\n`;
    code += `    stock: ${40 + Math.floor(Math.random() * 60)},\n`;
    code += `    rating: ${4 + Math.floor(Math.random() * 2)}\n`;
    code += `  }${i < accessories.length - 1 ? ',' : ''}\n`;
  });
  
  code += `];\n`;
  
  return code;
};

const seedCode = generateSeedCode();
fs.writeFileSync(path.join(__dirname, 'generated-seed-data.txt'), seedCode);

console.log('✅ Generated seed data code');
console.log('📄 Saved to: scripts/generated-seed-data.txt');
console.log('\n📊 Summary:');
console.log(`  📱 Smartphones: ${phones.length}`);
console.log(`  💻 Laptops: ${laptops.length}`);
console.log(`  📲 Tablets: ${tablets.length}`);
console.log(`  🎧 Accessories: ${accessories.length}`);
console.log(`  📦 Total: ${mapping.length}`);
console.log('\n💡 Next: Copy code từ generated-seed-data.txt vào seed/route.ts');
