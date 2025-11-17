import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

const categories = ['Điện thoại', 'Phụ kiện', 'Máy tính bảng', 'Laptop'];
const brands = ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Huawei', 'Sony', 'LG', 'Asus', 'Dell', 'HP', 'Lenovo'];

const generateProducts = () => {
  const products = [];

  for (let i = 1; i <= 200; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const price = Math.floor(Math.random() * 50000000) + 1000000; // 1M to 51M VND
    const originalPrice = Math.random() > 0.5 ? price + Math.floor(Math.random() * 10000000) : undefined;

    products.push({
      name: `${brand} ${category} Model ${i}`,
      description: `Mô tả chi tiết cho ${brand} ${category} Model ${i}. Sản phẩm chất lượng cao với nhiều tính năng nổi bật.`,
      price,
      originalPrice,
      images: [`/placeholder-${i % 5 + 1}.jpg`], // Placeholder images
      category,
      brand,
      stock: Math.floor(Math.random() * 100) + 1,
      rating: Math.floor(Math.random() * 5) + 1,
      features: [
        'Tính năng 1',
        'Tính năng 2',
        'Tính năng 3'
      ],
      specifications: {
        'Màn hình': '6.5 inch',
        'Camera': '48MP',
        'RAM': '8GB',
        'Bộ nhớ': '128GB'
      },
      isActive: true
    });
  }

  return products;
};

async function seedProducts() {
  try {
    await dbConnect();
    console.log('Connected to database');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const products = generateProducts();
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();