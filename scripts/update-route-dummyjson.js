const fs = require('fs');
const path = require('path');

console.log('📝 UPDATING ROUTE.TS WITH DUMMYJSON CLOUDINARY URLS\n');

// Read mapping
const mappingFile = path.join(__dirname, 'dummyjson-cloudinary-mapping.json');
if (!fs.existsSync(mappingFile)) {
  console.error('❌ dummyjson-cloudinary-mapping.json not found!');
  console.error('   Run download-dummyjson-images.js first.');
  process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
console.log('✅ Loaded mapping');
console.log(`   📱 Smartphones: ${Object.keys(mapping.smartphones || {}).length}`);
console.log(`   💻 Laptops: ${Object.keys(mapping.laptops || {}).length}`);
console.log(`   📲 Tablets: ${Object.keys(mapping.tablets || {}).length}`);
console.log(`   🎧 Accessories: ${Object.keys(mapping.accessories || {}).length}\n`);

// Generate route.ts
const routeContent = `import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import bcrypt from 'bcryptjs';
import User from '@/models/User';

// Database với hình ảnh từ DummyJSON -> Cloudinary

// ĐIỆN THOẠI CAO CẤP
const smartphones = [
  {
    name: 'iPhone 15 Pro Max 256GB',
    brand: 'Apple',
    price: 34990000,
    originalPrice: 36990000,
    category: 'Điện thoại',
    image: '${mapping.smartphones[1]}',
    desc: 'iPhone 15 Pro Max với chip A17 Pro, camera 48MP, khung titan, màn hình Super Retina XDR 6.7 inch',
    stock: 50,
    rating: 5
  },
  {
    name: 'Samsung Galaxy S24 Ultra 12GB 256GB',
    brand: 'Samsung',
    price: 29990000,
    originalPrice: 33990000,
    category: 'Điện thoại',
    image: '${mapping.smartphones[2]}',
    desc: 'Galaxy S24 Ultra với Snapdragon 8 Gen 3, camera 200MP, bút S Pen tích hợp, màn hình Dynamic AMOLED 2X 6.8 inch',
    stock: 45,
    rating: 5
  },
  {
    name: 'iPhone 14 Pro 128GB',
    brand: 'Apple',
    price: 25990000,
    originalPrice: 27990000,
    category: 'Điện thoại',
    image: '${mapping.smartphones[3]}',
    desc: 'iPhone 14 Pro với chip A16 Bionic, Dynamic Island, camera 48MP, màn hình ProMotion 120Hz',
    stock: 38,
    rating: 5
  },
  {
    name: 'Samsung Galaxy Z Fold5 12GB 256GB',
    brand: 'Samsung',
    price: 40990000,
    originalPrice: 44990000,
    category: 'Điện thoại',
    image: '${mapping.smartphones[4]}',
    desc: 'Galaxy Z Fold5 màn hình gập, Snapdragon 8 Gen 2, màn hình chính 7.6 inch, camera 50MP',
    stock: 25,
    rating: 5
  },
  {
    name: 'Xiaomi 14 Ultra 16GB 512GB',
    brand: 'Xiaomi',
    price: 27990000,
    originalPrice: 29990000,
    category: 'Điện thoại',
    image: '${mapping.smartphones[5]}',
    desc: 'Xiaomi 14 Ultra với camera Leica, Snapdragon 8 Gen 3, màn hình 2K+ 120Hz, sạc nhanh 90W',
    stock: 30,
    rating: 5
  },
  {
    name: 'OPPO Find N3 Flip 5G',
    brand: 'OPPO',
    price: 22990000,
    originalPrice: 24990000,
    category: 'Điện thoại',
    image: '${mapping.smartphones[6]}',
    desc: 'OPPO Find N3 Flip màn hình gập dọc, camera 50MP, chip MediaTek Dimensity 9200',
    stock: 28,
    rating: 4
  },
  {
    name: 'iPhone 13 128GB',
    brand: 'Apple',
    price: 17990000,
    originalPrice: 18990000,
    category: 'Điện thoại',
    image: '${mapping.smartphones[7]}',
    desc: 'iPhone 13 với chip A15 Bionic, camera kép 12MP, màn hình Super Retina XDR 6.1 inch',
    stock: 55,
    rating: 5
  },
  {
    name: 'Samsung Galaxy S23 FE 8GB 256GB',
    brand: 'Samsung',
    price: 14290000,
    originalPrice: 15990000,
    category: 'Điện thoại',
    image: '${mapping.smartphones[8]}',
    desc: 'Galaxy S23 FE với Exynos 2200, camera 50MP, màn hình Dynamic AMOLED 2X, pin 4500mAh',
    stock: 42,
    rating: 4
  },
  {
    name: 'Xiaomi Redmi Note 13 Pro 8GB',
    brand: 'Xiaomi',
    price: 7490000,
    originalPrice: 8490000,
    category: 'Điện thoại',
    image: '${mapping.smartphones[9]}',
    desc: 'Redmi Note 13 Pro camera 200MP, Snapdragon 7s Gen 2, màn hình AMOLED 120Hz',
    stock: 80,
    rating: 4
  },
  {
    name: 'OPPO Reno11 F 5G 8GB',
    brand: 'OPPO',
    price: 8990000,
    originalPrice: 9990000,
    category: 'Điện thoại',
    image: '${mapping.smartphones[10]}',
    desc: 'OPPO Reno11 F camera 64MP, MediaTek Dimensity 7050, màn hình AMOLED 120Hz',
    stock: 65,
    rating: 4
  },
  {
    name: 'Vivo V30 5G 12GB',
    brand: 'Vivo',
    price: 12990000,
    originalPrice: 13990000,
    category: 'Điện thoại',
    image: '${mapping.smartphones[11]}',
    desc: 'Vivo V30 camera chân dung 50MP, Snapdragon 7 Gen 3, màn hình AMOLED cong',
    stock: 50,
    rating: 4
  },
  {
    name: 'Realme 12 Pro+ 5G 12GB',
    brand: 'Realme',
    price: 11490000,
    originalPrice: 12490000,
    category: 'Điện thoại',
    image: '${mapping.smartphones[12]}',
    desc: 'Realme 12 Pro+ camera tele 64MP, Snapdragon 7s Gen 2, màn hình AMOLED 120Hz',
    stock: 60,
    rating: 4
  }
];

// LAPTOP CAO CẤP
const laptops = [
  {
    name: 'MacBook Pro 14 M3 Pro 18GB 512GB',
    brand: 'Apple',
    price: 52990000,
    originalPrice: 55990000,
    category: 'Laptop',
    image: '${mapping.laptops[1]}',
    desc: 'MacBook Pro 14 inch với chip M3 Pro, RAM 18GB, SSD 512GB, màn hình Liquid Retina XDR',
    stock: 20,
    rating: 5
  },
  {
    name: 'Dell XPS 13 Plus i7 16GB 512GB',
    brand: 'Dell',
    price: 42990000,
    originalPrice: 45990000,
    category: 'Laptop',
    image: '${mapping.laptops[2]}',
    desc: 'Dell XPS 13 Plus với Intel Core i7 Gen 13, RAM 16GB, SSD 512GB, màn hình OLED 13.4 inch',
    stock: 18,
    rating: 5
  },
  {
    name: 'ASUS ROG Strix G16 i9 RTX 4060',
    brand: 'ASUS',
    price: 44990000,
    originalPrice: 49990000,
    category: 'Laptop',
    image: '${mapping.laptops[3]}',
    desc: 'ASUS ROG Strix G16 gaming laptop, Intel i9 Gen 13, RTX 4060, RAM 16GB, màn hình 165Hz',
    stock: 15,
    rating: 5
  },
  {
    name: 'MSI Titan GT77 HX i9 RTX 4090',
    brand: 'MSI',
    price: 124990000,
    originalPrice: 139990000,
    category: 'Laptop',
    image: '${mapping.laptops[4]}',
    desc: 'MSI Titan GT77 HX siêu phẩm gaming, Intel i9 Gen 13, RTX 4090, RAM 64GB, màn hình 4K 144Hz',
    stock: 5,
    rating: 5
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon Gen 11',
    brand: 'Lenovo',
    price: 42990000,
    originalPrice: 46990000,
    category: 'Laptop',
    image: '${mapping.laptops[5]}',
    desc: 'Lenovo ThinkPad X1 Carbon Gen 11, Intel i7 Gen 13, RAM 16GB, SSD 512GB, siêu mỏng nhẹ',
    stock: 22,
    rating: 5
  },
  {
    name: 'HP Envy 13 Ryzen 7 16GB 512GB',
    brand: 'HP',
    price: 24990000,
    originalPrice: 26990000,
    category: 'Laptop',
    image: '${mapping.laptops[6]}',
    desc: 'HP Envy 13 với AMD Ryzen 7, RAM 16GB, SSD 512GB, màn hình Full HD, thiết kế cao cấp',
    stock: 28,
    rating: 4
  }
];

// MÁY TÍNH BẢNG
const tablets = [
  {
    name: 'iPad Pro M2 11 inch WiFi 128GB',
    brand: 'Apple',
    price: 21990000,
    originalPrice: 23990000,
    category: 'Máy tính bảng',
    image: '${mapping.tablets[1]}',
    desc: 'iPad Pro 11 inch với chip M2, màn hình Liquid Retina, Apple Pencil Gen 2, Face ID',
    stock: 32,
    rating: 5
  },
  {
    name: 'iPad Air 5 M1 WiFi 64GB',
    brand: 'Apple',
    price: 14990000,
    originalPrice: 16990000,
    category: 'Máy tính bảng',
    image: '${mapping.tablets[2]}',
    desc: 'iPad Air 5 với chip M1, màn hình 10.9 inch, Touch ID, hỗ trợ Apple Pencil',
    stock: 45,
    rating: 5
  },
  {
    name: 'Samsung Galaxy Tab S9 Ultra 5G',
    brand: 'Samsung',
    price: 29990000,
    originalPrice: 32990000,
    category: 'Máy tính bảng',
    image: '${mapping.tablets[3]}',
    desc: 'Galaxy Tab S9 Ultra với màn hình 14.6 inch, S Pen, Snapdragon 8 Gen 2, chống nước IP68',
    stock: 18,
    rating: 5
  },
  {
    name: 'Samsung Galaxy Tab S9 FE WiFi',
    brand: 'Samsung',
    price: 10990000,
    originalPrice: 11990000,
    category: 'Máy tính bảng',
    image: '${mapping.tablets[4]}',
    desc: 'Galaxy Tab S9 FE với màn hình 10.9 inch, S Pen đi kèm, pin 8000mAh',
    stock: 40,
    rating: 4
  },
  {
    name: 'Xiaomi Pad 6 8GB 256GB',
    brand: 'Xiaomi',
    price: 8990000,
    originalPrice: 9990000,
    category: 'Máy tính bảng',
    image: '${mapping.tablets[5]}',
    desc: 'Xiaomi Pad 6 với Snapdragon 870, màn hình 11 inch 144Hz, loa 4 cạnh Dolby Atmos',
    stock: 35,
    rating: 4
  }
];

// PHỤ KIỆN CHẤT LƯỢNG CAO
const accessories = [
  {
    name: 'Tai nghe Apple AirPods Pro 2',
    brand: 'Apple',
    price: 6490000,
    originalPrice: 6990000,
    category: 'Phụ kiện',
    image: '${mapping.accessories[1]}',
    desc: 'AirPods Pro 2 với chip H2, chống ồn chủ động ANC, âm thanh không gian, sạc USB-C',
    stock: 50,
    rating: 5
  },
  {
    name: 'Tai nghe Sony WH-1000XM5',
    brand: 'Sony',
    price: 8990000,
    originalPrice: 9990000,
    category: 'Phụ kiện',
    image: '${mapping.accessories[2]}',
    desc: 'Sony WH-1000XM5 chống ồn hàng đầu, âm thanh LDAC, pin 30 giờ, thiết kế cao cấp',
    stock: 35,
    rating: 5
  },
  {
    name: 'Sạc dự phòng Anker 737 PowerCore 24K',
    brand: 'Anker',
    price: 2490000,
    category: 'Phụ kiện',
    image: '${mapping.accessories[3]}',
    desc: 'Anker 737 PowerCore 24000mAh, sạc nhanh 140W, 2 cổng USB-C + 1 USB-A, màn hình LED',
    stock: 60,
    rating: 5
  },
  {
    name: 'Chuột Logitech MX Master 3S',
    brand: 'Logitech',
    price: 2490000,
    category: 'Phụ kiện',
    image: '${mapping.accessories[4]}',
    desc: 'Logitech MX Master 3S cảm biến 8000 DPI, pin 70 ngày, kết nối đa thiết bị',
    stock: 45,
    rating: 5
  },
  {
    name: 'Chuột Apple Magic Mouse',
    brand: 'Apple',
    price: 2290000,
    category: 'Phụ kiện',
    image: '${mapping.accessories[5]}',
    desc: 'Chuột không dây, bề mặt Multi-Touch, sạc Lightning, tương thích Mac',
    stock: 50,
    rating: 4
  },
  {
    name: 'Chuột Logitech G Pro X Superlight',
    brand: 'Logitech',
    price: 3290000,
    category: 'Phụ kiện',
    image: '${mapping.accessories[6]}',
    desc: 'Chuột gaming siêu nhẹ 63g, Hero 25K sensor, wireless, pin 70 giờ',
    stock: 45,
    rating: 5
  },
  {
    name: 'Bàn phím Keychron K8 Pro',
    brand: 'Keychron',
    price: 2990000,
    category: 'Phụ kiện',
    image: '${mapping.accessories[7]}',
    desc: 'Bàn phím cơ TKL, Hot-swap, RGB, kết nối wireless/có dây, switch Gateron',
    stock: 40,
    rating: 4
  },
  {
    name: 'Bàn phím Apple Magic Keyboard',
    brand: 'Apple',
    price: 2990000,
    originalPrice: 3290000,
    category: 'Phụ kiện',
    image: '${mapping.accessories[8]}',
    desc: 'Bàn phím không dây, pin sạc, scissor mechanism, layout Mac',
    stock: 35,
    rating: 5
  },
  {
    name: 'Bàn phím Logitech MX Keys',
    brand: 'Logitech',
    price: 2690000,
    category: 'Phụ kiện',
    image: '${mapping.accessories[9]}',
    desc: 'Bàn phím full-size, đèn nền thông minh, kết nối 3 thiết bị, pin 10 ngày',
    stock: 40,
    rating: 5
  },
  {
    name: 'Bàn phím Corsair K70 RGB Pro',
    brand: 'Corsair',
    price: 3990000,
    category: 'Phụ kiện',
    image: '${mapping.accessories[10]}',
    desc: 'Bàn phím gaming cơ, Cherry MX switch, RGB Capellix, PBT keycaps',
    stock: 30,
    rating: 5
  },
  {
    name: 'Sạc nhanh Anker 737 GaN Prime 120W',
    brand: 'Anker',
    price: 1790000,
    category: 'Phụ kiện',
    image: '${mapping.accessories[11]}',
    desc: 'Anker 737 sạc GaN 120W, 3 cổng, sạc nhanh laptop/điện thoại, nhỏ gọn',
    stock: 55,
    rating: 5
  },
  {
    name: 'Ốp lưng iPhone 15 Pro Max Apple',
    brand: 'Apple',
    price: 1290000,
    category: 'Phụ kiện',
    image: '${mapping.accessories[12]}',
    desc: 'Ốp lưng Apple Silicone MagSafe chính hãng, bảo vệ toàn diện, nhiều màu sắc',
    stock: 70,
    rating: 5
  },
  {
    name: 'Cáp sạc Anker PowerLine III USB-C',
    brand: 'Anker',
    price: 390000,
    category: 'Phụ kiện',
    image: '${mapping.accessories[13]}',
    desc: 'Cáp USB-C to USB-C 1.8m, sạc nhanh 100W, bọc nylon siêu bền',
    stock: 80,
    rating: 4
  },
  {
    name: 'Giá đỡ điện thoại Baseus Gravity',
    brand: 'Baseus',
    price: 290000,
    category: 'Phụ kiện',
    image: '${mapping.accessories[14]}',
    desc: 'Giá đỡ điện thoại ô tô Baseus, cơ chế trọng lực, xoay 360 độ',
    stock: 65,
    rating: 4
  }
];

const generateProducts = async () => {
  const allProducts = [...smartphones, ...laptops, ...tablets, ...accessories];
  const colors = ['Đen', 'Trắng', 'Xanh', 'Đỏ', 'Vàng', 'Tím', 'Hồng'];
  const storages = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const rams = ['4GB', '6GB', '8GB', '12GB', '16GB'];
  
  const expandedProducts = [];
  const totalNeeded = 200;
  const productsPerBase = Math.ceil(totalNeeded / allProducts.length);
  
  for (const product of allProducts) {
    const variantsToCreate = Math.min(productsPerBase, totalNeeded - expandedProducts.length);
    
    for (let i = 0; i < variantsToCreate; i++) {
      const color = colors[i % colors.length];
      const storage = storages[i % storages.length];
      const ram = rams[i % rams.length];
      const priceVariation = (i * 500000);
      
      expandedProducts.push({
        name: \`\${product.name} \${color} \${storage}\`,
        description: \`\${product.desc}. Phiên bản \${color} - \${ram} RAM - \${storage} bộ nhớ.\`,
        price: product.price + priceVariation,
        originalPrice: product.originalPrice ? product.originalPrice + priceVariation : undefined,
        images: [product.image],
        category: product.category,
        brand: product.brand,
        stock: Math.floor(Math.random() * 50) + 50,
        sold: Math.floor(Math.random() * 100),
        rating: product.rating || 4 + (Math.random() * 1),
        features: [
          'Bảo hành chính hãng',
          'Giao hàng nhanh toàn quốc',
          'Hỗ trợ đổi trả trong 7 ngày',
          'Sản phẩm chính hãng 100%',
          \`Màu \${color}\`,
          \`Bộ nhớ \${storage}\`,
          \`RAM \${ram}\`
        ],
        specifications: {
          'Thương hiệu': product.brand || 'Không xác định',
          'Danh mục': product.category,
          'Màu sắc': color,
          'Bộ nhớ': storage,
          'RAM': ram,
          'Tình trạng': 'Còn hàng',
          'Bảo hành': '12 tháng'
        },
        isActive: true
      });
      
      if (expandedProducts.length >= totalNeeded) break;
    }
    if (expandedProducts.length >= totalNeeded) break;
  }

  return expandedProducts;
};

export async function GET() {
  try {
    console.log('🌱 Starting seed...');
    await dbConnect();
    console.log('✅ MongoDB connected');

    const deletedCount = await Product.deleteMany({});
    console.log(\`🗑️  Cleared \${deletedCount.deletedCount} products\`);

    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const defaultPassword = process.env.SEED_PASSWORD || 'admin123';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash(defaultPassword, 10);
      await User.create({ 
        name: 'Admin', 
        email: adminEmail, 
        password: hashed, 
        role: 'admin' 
      });
      console.log(\`✅ Admin created (email: \${adminEmail}, password: \${defaultPassword})\`);
    }

    console.log('📦 Generating 200 products...');
    const products = await generateProducts();
    
    console.log('💾 Saving to database...');
    await Product.insertMany(products);
    
    const finalCount = await Product.countDocuments({});
    const categoryCount = {
      'Điện thoại': await Product.countDocuments({ category: 'Điện thoại' }),
      'Laptop': await Product.countDocuments({ category: 'Laptop' }),
      'Máy tính bảng': await Product.countDocuments({ category: 'Máy tính bảng' }),
      'Phụ kiện': await Product.countDocuments({ category: 'Phụ kiện' })
    };
    
    return NextResponse.json({ 
      success: true,
      message: \`✅ Seeded \${finalCount} products with DummyJSON images via Cloudinary!\`,
      count: finalCount,
      categories: categoryCount
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to seed' 
    }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
`;

const routePath = path.join(__dirname, '../src/app/api/seed/route.ts');
fs.writeFileSync(routePath, routeContent);

console.log('✅ Updated route.ts with DummyJSON Cloudinary URLs');
console.log(`📁 ${routePath}`);
console.log('\n📋 Summary:');
console.log('   📱 12 Smartphones');
console.log('   💻 6 Laptops');
console.log('   📲 5 Tablets');
console.log('   🎧 14 Accessories');
console.log('   ─────────────────');
console.log('   📦 37 base → 200 variants');
console.log('\n🎯 Next: http://localhost:3000/api/seed');
