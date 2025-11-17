import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

// Database mới với sản phẩm thật và hình ảnh chất lượng cao

// ĐIỆN THOẠI CAO CẤP - Hình ảnh từ nguồn chính thức
const smartphones = [
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
    name: 'iPhone 14 Pro 128GB',
    brand: 'Apple',
    price: 25990000,
    originalPrice: 27990000,
    category: 'Điện thoại',
    image: 'https://cdn.tgdd.vn/Products/Images/42/289700/iphone-14-pro-vang-thumb-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-z-fold5-kem-256gb-thumbnew-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/42/322096/xiaomi-14-ultra-black-thumbnew-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/42/313220/oppo-find-n3-flip-pink-thumbnew-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pink-1-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/42/316771/samsung-galaxy-s23-fe-xanh-thumbnew-600x600.jpg',
    desc: 'Galaxy S23 FE với Exynos 2200, camera 50MP, màn hình Dynamic AMOLED 2X, pin 4500mAh',
    stock: 42,
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
    image: 'https://cdn.tgdd.vn/Products/Images/44/309016/macbook-pro-14-inch-m3-pro-2023-xam-thumbnew-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/44/289908/dell-xps-13-plus-i7-1360p-win11-thumb-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/44/316988/asus-rog-strix-g16-i9-13980hx-thumb-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/44/303391/msi-titan-gt77-hx-13vi-i9-13950hx-thumb-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/44/306243/lenovo-thinkpad-x1-carbon-gen-11-i7-1355u-thumb-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/44/307205/hp-envy-13-ba1535tu-i7-1195g7-thumb-1-1-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/522/325530/ipad-pro-11-inch-m2-wifi-128gb-2022-xam-thumb-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/522/325515/ipad-air-5-wifi-64gb-2022-xanh-duong-thumb-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/522/309816/samsung-galaxy-tab-s9-ultra-5g-xam-thumb-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/522/319839/samsung-galaxy-tab-s9-fe-wifi-xam-thumb-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/522/309816/samsung-galaxy-tab-s9-ultra-5g-xam-thumb-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/54/289780/tai-nghe-bluetooth-airpods-pro-2nd-gen-usb-c-charge-apple-mqd83-thumb-1-600x600.jpg',
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
    image: 'https://cdn.tgdd.vn/Products/Images/54/308860/tai-nghe-chup-tai-bluetooth-sony-wh-1000xm5-bac-thumb-1-600x600.jpg',
    desc: 'Sony WH-1000XM5 chống ồn hàng đầu, âm thanh LDAC, pin 30 giờ, thiết kế cao cấp',
    stock: 35,
    rating: 5
  },
  {
    name: 'Sạc dự phòng Anker 737 PowerCore 24K',
    brand: 'Anker',
    price: 2490000,
    category: 'Phụ kiện',
    image: 'https://cdn.tgdd.vn/Products/Images/57/320243/sac-du-phong-polymer-24000mah-type-c-pd-anker-737-a1289-den-thumb-600x600.jpg',
    desc: 'Anker 737 PowerCore 24000mAh, sạc nhanh 140W, 2 cổng USB-C + 1 USB-A, màn hình LED',
    stock: 60,
    rating: 5
  },
  {
    name: 'Chuột Logitech MX Master 3S',
    brand: 'Logitech',
    price: 2490000,
    category: 'Phụ kiện',
    image: 'https://cdn.tgdd.vn/Products/Images/86/304891/chuot-khong-day-logitech-mx-master-3s-den-thumb-1-600x600.jpg',
    desc: 'Logitech MX Master 3S cảm biến 8000 DPI, pin 70 ngày, kết nối đa thiết bị',
    stock: 45,
    rating: 5
  },
  {
    name: 'Chuột Apple Magic Mouse',
    brand: 'Apple',
    price: 2290000,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&h=800&fit=crop&crop=center',
    desc: 'Chuột không dây, bề mặt Multi-Touch, sạc Lightning, tương thích Mac'
  },
  {
    name: 'Chuột Logitech G Pro X Superlight',
    brand: 'Logitech',
    price: 3290000,
    image: 'https://images.unsplash.com/photo-1622457746212-c1473cb5ecc9?w=800&h=800&fit=crop&crop=center',
    desc: 'Chuột gaming siêu nhẹ 63g, Hero 25K sensor, wireless, pin 70 giờ'
  },

  {
    name: 'Bàn phím Keychron K8 Pro',
    brand: 'Keychron',
    price: 2990000,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&h=800&fit=crop&crop=center',
    desc: 'Bàn phím cơ TKL, Hot-swap, RGB, kết nối wireless/có dây, switch Gateron'
  },
  {
    name: 'Bàn phím Apple Magic Keyboard',
    brand: 'Apple',
    price: 2990000,
    originalPrice: 3290000,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop&crop=center',
    desc: 'Bàn phím không dây, pin sạc, scissor mechanism, layout Mac'
  },
  {
    name: 'Bàn phím Logitech MX Keys',
    brand: 'Logitech',
    price: 2690000,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&h=800&fit=crop&crop=center',
    desc: 'Bàn phím full-size, đèn nền thông minh, kết nối 3 thiết bị, pin 10 ngày'
  },
  {
    name: 'Bàn phím Corsair K70 RGB Pro',
    brand: 'Corsair',
    price: 3990000,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&h=800&fit=crop&crop=center',
    desc: 'Bàn phím gaming cơ, Cherry MX switch, RGB Capellix, PBT keycaps'
  },

  {
    name: 'Bàn phím Logitech MX Keys',
    brand: 'Logitech',
    price: 2690000,
    category: 'Phụ kiện',
    image: 'https://cdn.tgdd.vn/Products/Images/4547/228089/ban-phim-khong-day-logitech-mx-keys-den-thumb-1-600x600.jpg',
    desc: 'Logitech MX Keys bàn phím full-size, đèn nền thông minh, kết nối 3 thiết bị',
    stock: 40,
    rating: 5
  },
  {
    name: 'Sạc nhanh Anker 737 GaN Prime 120W',
    brand: 'Anker',
    price: 1790000,
    category: 'Phụ kiện',
    image: 'https://cdn.tgdd.vn/Products/Images/58/319851/sac-anker-3-cong-usb-type-c-120w-gan-prime-a2340-den-thumb-600x600.jpg',
    desc: 'Anker 737 sạc GaN 120W, 3 cổng, sạc nhanh laptop/điện thoại, nhỏ gọn',
    stock: 55,
    rating: 5
  },
  {
    name: 'Ốp lưng iPhone 15 Pro Max Apple',
    brand: 'Apple',
    price: 1290000,
    category: 'Phụ kiện',
    image: 'https://cdn.tgdd.vn/Products/Images/4555/322089/op-lung-iphone-15-pro-max-apple-silicone-magsafe-thumb-600x600.jpg',
    desc: 'Ốp lưng Apple Silicone MagSafe chính hãng, bảo vệ toàn diện, nhiều màu sắc',
    stock: 70,
    rating: 5
  },
  {
    name: 'Cáp sạc Anker PowerLine III USB-C',
    brand: 'Anker',
    price: 390000,
    category: 'Phụ kiện',
    image: 'https://cdn.tgdd.vn/Products/Images/58/235570/cap-type-c-anker-powerline-iii-a8853-1-8m-trang-thumb-600x600.jpg',
    desc: 'Cáp USB-C to USB-C 1.8m, sạc nhanh 100W, bọc nylon siêu bền',
    stock: 80,
    rating: 4
  },
  {
    name: 'Giá đỡ điện thoại Baseus Gravity',
    brand: 'Baseus',
    price: 290000,
    category: 'Phụ kiện',
    image: 'https://cdn.tgdd.vn/Products/Images/6667/280543/gia-do-dien-thoai-o-to-baseus-gravity-car-mount-thumb-600x600.jpg',
    desc: 'Giá đỡ điện thoại ô tô Baseus, cơ chế trọng lực, xoay 360 độ',
    stock: 65,
    rating: 4
  }
];

// Hàm tạo sản phẩm từ dữ liệu thật
const generateProducts = async () => {
  const allProducts = [
    ...smartphones,
    ...laptops,
    ...tablets,
    ...accessories
  ];

  return allProducts.map(product => ({
    name: product.name,
    description: product.desc,
    price: product.price,
    originalPrice: product.originalPrice,
    images: [product.image],
    category: product.category,
    brand: product.brand,
    stock: product.stock,
    rating: product.rating,
    features: [
      'Bảo hành chính hãng',
      'Giao hàng nhanh toàn quốc',
      'Hỗ trợ đổi trả trong 7 ngày',
      'Sản phẩm chính hãng 100%'
    ],
    specifications: {
      'Thương hiệu': product.brand,
      'Danh mục': product.category,
      'Tình trạng': 'Còn hàng',
      'Bảo hành': '12 tháng'
    },
    isActive: true
  }));
};

export async function GET() {
  try {
    await dbConnect();

    // Clear existing products
    await Product.deleteMany({});

    // Insert new products
    const products = await generateProducts();
    await Product.insertMany(products);

    return NextResponse.json({ message: `Seeded ${products.length} products successfully` });
  } catch (error) {
    console.error('Error seeding products:', error);
    return NextResponse.json({ error: 'Failed to seed products' }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}