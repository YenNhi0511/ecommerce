import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import bcrypt from 'bcryptjs';
import User from '@/models/User';

// Simple product database (minimal)
const simpleProducts = [
  {
    name: 'iPhone 15 Pro Max 256GB',
    brand: 'Apple',
    price: 34990000,
    originalPrice: 36990000,
    category: 'Điện thoại',
    image: 'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/42/320721/samsung-galaxy-s24-ultra-grey-thumbnew-600x600.jpg',
    desc: 'Galaxy S24 Ultra với Snapdragon 8 Gen 3, camera 200MP, bút S Pen tích hợp, màn hình Dynamic AMOLED 2X 6.8 inch',
    stock: 45,
    rating: 5
  },
  {
    name: 'MacBook Pro 14 M3 Pro 18GB 512GB',
    brand: 'Apple',
    price: 52990000,
    originalPrice: 55990000,
    category: 'Laptop',
    image: 'https://cdn.tgdd.vn/Products/Images/44/309016/macbook-pro-14-inch-m3-pro-2023-xam-thumbnew-600x600.jpg',
    desc: 'MacBook Pro 14 inch với chip M3 Pro, RAM 18GB, SSD 512GB, màn hình Liquid Retina XDR',
    stock: 20,
    rating: 5
  },
  {
    name: 'iPad Pro M2 11 inch WiFi 128GB',
    brand: 'Apple',
    price: 21990000,
    originalPrice: 23990000,
    category: 'Máy tính bảng',
    image: 'https://cdn.tgdd.vn/Products/Images/522/325530/ipad-pro-11-inch-m2-wifi-128gb-2022-xam-thumb-600x600.jpg',
    desc: 'iPad Pro 11 inch với chip M2, màn hình Liquid Retina, Apple Pencil Gen 2, Face ID',
    stock: 32,
    rating: 5
  },
  {
    name: 'Apple Watch Series 9 45mm',
    brand: 'Apple',
    price: 12990000,
    originalPrice: 13990000,
    category: 'Đồng hồ thông minh',
    image: 'https://cdn.tgdd.vn/Products/Images/896/299496/apple-watch-series-9-45mm-midnight-new-600x600.jpg',
    desc: 'Apple Watch Series 9 với màn hình Always-On, chụp điện tâm đồ, pin 18 giờ, kết nối LTE',
    stock: 40,
    rating: 5
  },
];

async function createProductsData() {
  const productDetails = {
    'Thông tin chung': 'Sản phẩm chính hãng, bảo hành quốc tế',
    'Danh mục': 'Điện tử - Công nghệ',
    'Tình trạng': 'Còn hàng',
    'Bảo hành': '12 tháng'
  };

  return simpleProducts.map((product, index) => ({
    ...product,
    _id: undefined,
    sku: `SKU${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    description: product.desc,
    details: productDetails,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

export async function GET() {
  try {
    console.log('🌱 Starting simple seed process (No Cloudinary)...');
    await dbConnect();
    console.log('✅ MongoDB connected');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    // Create accounts
    const adminEmail = 'admin@example.com';
    const sellerEmail = 'seller@example.com';
    const defaultPassword = 'Password123';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash(defaultPassword, 10);
      await User.create({ 
        name: 'Admin', 
        email: adminEmail, 
        password: hashed, 
        phone: '0123456789',
        role: 'admin' 
      });
      console.log('✅ Admin account created');
    }

    const existingSeller = await User.findOne({ email: sellerEmail });
    if (!existingSeller) {
      const hashed = await bcrypt.hash(defaultPassword, 10);
      await User.create({ 
        name: 'Seller', 
        email: sellerEmail, 
        password: hashed, 
        phone: '0987654321',
        role: 'seller' 
      });
      console.log('✅ Seller account created');
    }

    // Create products
    const products = await createProductsData();
    console.log(`📦 Created ${products.length} products`);
    
    // Save to database
    await Product.insertMany(products);
    console.log(`✅ Saved ${products.length} products to database`);

    return NextResponse.json({ 
      message: `✅ Seeded ${products.length} products successfully! Admin: admin@example.com / Password123 | Seller: seller@example.com / Password123`,
      productsCreated: products.length,
      accounts: {
        admin: { email: 'admin@example.com', password: 'Password123' },
        seller: { email: 'seller@example.com', password: 'Password123' }
      }
    });
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to seed products',
      details: error
    }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
