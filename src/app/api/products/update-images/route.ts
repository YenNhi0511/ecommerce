import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

// High-quality product images from Unsplash
const highQualityImages = {
  'Điện thoại': [
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1544866092-1935c5ef440a?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop&crop=center'
  ],
  'Laptop': [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1587614295999-6c1a3c7e98d0?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=800&fit=crop&crop=center'
  ],
  'Máy tính bảng': [
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&h=800&fit=crop&crop=center'
  ],
  'Phụ kiện': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&h=800&fit=crop&crop=center'
  ]
};

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { category, updateAll = false } = body;

    let query: any = { isActive: true };

    if (!updateAll && category) {
      query.category = category;
    }

    // Get all products to update
    const products = await Product.find(query);

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm nào' },
        { status: 404 }
      );
    }

    let updatedCount = 0;

    // Update images for each product
    for (const product of products) {
      const categoryImages = highQualityImages[product.category as keyof typeof highQualityImages] || highQualityImages['Phụ kiện'];
      const randomImage = categoryImages[Math.floor(Math.random() * categoryImages.length)];

      await Product.findByIdAndUpdate(product._id, {
        images: [randomImage],
        updatedAt: new Date()
      });

      updatedCount++;
    }

    return NextResponse.json({
      message: `Cập nhật hình ảnh thành công cho ${updatedCount} sản phẩm`,
      updatedCount,
      category: updateAll ? 'Tất cả' : category
    });

  } catch (error) {
    console.error('Error updating product images:', error);
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}