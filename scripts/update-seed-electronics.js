const fs = require('fs');
const path = require('path');

console.log('📖 Reading final-200-electronics.json...\n');

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'final-200-electronics.json'), 'utf8')
);

console.log(`✅ Loaded ${products.length} electronics products\n`);

// Generate seed route.ts
let code = `import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// 200 sản phẩm điện tử với ảnh thật từ Cloudinary
const products = [\n`;

products.forEach((p, i) => {
  code += `  {\n`;
  code += `    name: '${p.name.replace(/'/g, "\\'")}',\n`;
  code += `    brand: '${p.brand}',\n`;
  code += `    price: ${p.price},\n`;
  code += `    originalPrice: ${p.originalPrice},\n`;
  code += `    category: '${p.category}',\n`;
  code += `    image: '${p.image}',\n`;
  code += `    desc: '${(p.desc || '').substring(0, 150).replace(/'/g, "\\'")}',\n`;
  code += `    stock: ${p.stock},\n`;
  code += `    rating: ${p.rating}\n`;
  code += `  }${i < products.length - 1 ? ',' : ''}\n`;
});

code += `];\n\n`;

code += `export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');
    
    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(\`✅ Inserted \${insertedProducts.length} products\`);
    
    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ Created admin user');
    }
    
    return NextResponse.json({
      success: true,
      message: \`Database seeded successfully with \${insertedProducts.length} electronics products\`,
      count: insertedProducts.length,
      categories: {
        'Điện thoại': insertedProducts.filter(p => p.category === 'Điện thoại').length,
        'Laptop': insertedProducts.filter(p => p.category === 'Laptop').length,
        'Máy tính bảng': insertedProducts.filter(p => p.category === 'Máy tính bảng').length,
        'Phụ kiện': insertedProducts.filter(p => p.category === 'Phụ kiện').length,
      }
    });
  } catch (error: any) {
    console.error('❌ Seed error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}\n`;

// Save
const outputPath = path.join(__dirname, '../src/app/api/seed/route.ts');
fs.writeFileSync(outputPath, code);

console.log('💾 Updated seed endpoint:');
console.log(`   ${outputPath}\n`);

console.log('📊 Products by category:');
const byCat = {};
products.forEach(p => {
  byCat[p.category] = (byCat[p.category] || 0) + 1;
});
Object.entries(byCat).forEach(([cat, count]) => {
  console.log(`   ${cat}: ${count} products`);
});

console.log('\n✨ DONE! Run: http://localhost:3000/api/seed');
