const fs = require('fs');
const path = require('path');

console.log('📖 Reading complete-products-200.json...\n');

const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'complete-products-200.json'), 'utf8')
);

console.log(`✅ Loaded ${productsData.length} products\n`);

// Group by category
const categories = {};
productsData.forEach(p => {
  const cat = p.category;
  if (!categories[cat]) categories[cat] = [];
  categories[cat].push(p);
});

console.log('📊 Products by category:');
Object.keys(categories).forEach(cat => {
  console.log(`  ${cat}: ${categories[cat].length} products`);
});

// Convert price USD to VND
const usdToVnd = (usd) => Math.round(usd * 24000 / 1000) * 1000;

// Generate 200 products với variants
const allBaseProducts = productsData.slice(0, 40); // Take 40 base products

const variants = {
  colors: ['Đen', 'Trắng', 'Xanh', 'Đỏ', 'Vàng'],
  storage: ['64GB', '128GB', '256GB', '512GB', '1TB'],
  ram: ['4GB', '8GB', '12GB', '16GB', '32GB']
};

const generateVariants = (baseProduct, count) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    const color = variants.colors[i % variants.colors.length];
    const storage = variants.storage[i % variants.storage.length];
    const priceMultiplier = 1 + (i * 0.1);
    
    result.push({
      ...baseProduct,
      name: `${baseProduct.title} ${color} ${storage}`,
      price: Math.round(usdToVnd(baseProduct.price) * priceMultiplier / 1000) * 1000,
      originalPrice: Math.round(usdToVnd(baseProduct.price) * priceMultiplier * 1.15 / 1000) * 1000,
    });
  }
  return result;
};

// Generate 200 products
const finalProducts = [];
allBaseProducts.forEach(base => {
  const variants = generateVariants(base, 5); // 5 variants per base = 40*5 = 200
  finalProducts.push(...variants);
});

console.log(`\n✅ Generated ${finalProducts.length} products with variants\n`);

// Generate TypeScript code
let code = `import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// 200 products generated from DummyJSON with Cloudinary images
const products = [\n`;

finalProducts.forEach((p, i) => {
  code += `  {\n`;
  code += `    name: '${p.name.replace(/'/g, "\\'")}',\n`;
  code += `    brand: '${p.brand}',\n`;
  code += `    price: ${p.price},\n`;
  code += `    originalPrice: ${p.originalPrice},\n`;
  code += `    category: '${p.category}',\n`;
  code += `    image: '${p.image}',\n`;
  code += `    desc: '${(p.description || p.title).substring(0, 100).replace(/'/g, "\\'")}',\n`;
  code += `    stock: ${p.stock || 50},\n`;
  code += `    rating: ${p.rating || 4}\n`;
  code += `  }${i < finalProducts.length - 1 ? ',' : ''}\n`;
});

code += `];\n\n`;

code += `export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(\`Inserted \${insertedProducts.length} products\`);
    
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
      console.log('Created admin user');
    }
    
    return NextResponse.json({
      success: true,
      message: \`Database seeded with \${insertedProducts.length} products\`,
      count: insertedProducts.length
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}`;

// Save to file
const outputPath = path.join(__dirname, '../src/app/api/seed/route.ts');
fs.writeFileSync(outputPath, code);

console.log('💾 Generated new seed endpoint:');
console.log(`   ${outputPath}`);
console.log(`\n✨ DONE! You can now run: http://localhost:3000/api/seed`);
