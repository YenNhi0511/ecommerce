import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import CategoryFilters from '@/components/CategoryFilters';

interface PageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const categoryNames: { [key: string]: string } = {
  'dien-thoai': 'Điện thoại',
  'phu-kien': 'Phụ kiện',
  'may-tinh-bang': 'Máy tính bảng',
  'laptop': 'Laptop',
};

async function getFilteredProducts(
  category: string,
  minPrice?: number,
  maxPrice?: number,
  brands?: string[],
  sort?: string,
  page: number = 1,
  limit: number = 20
) {
  await dbConnect();

  const query: any = {
    category,
    isActive: true,
  };

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = minPrice;
    if (maxPrice) query.price.$lte = maxPrice;
  }

  if (brands && brands.length > 0) {
    query.brand = { $in: brands };
  }

  let sortQuery: any = {};
  switch (sort) {
    case 'price-asc':
      sortQuery = { price: 1 };
      break;
    case 'price-desc':
      sortQuery = { price: -1 };
      break;
    case 'rating':
      sortQuery = { rating: -1 };
      break;
    default:
      sortQuery = { createdAt: -1 };
  }

  const skip = (page - 1) * limit;
  const products = await Product.find(query)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Product.countDocuments(query);

  return { products, total };
}

async function getBrandsForCategory(category: string) {
  await dbConnect();
  const brands = await Product.distinct('brand', { category, isActive: true });
  return brands.filter(Boolean);
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = params;
  const categoryName = categoryNames[slug] || 'Danh mục';
  const page = parseInt(searchParams.page as string) || 1;
  const limit = 20;

  const minPrice = searchParams.minPrice ? parseInt(searchParams.minPrice as string) : undefined;
  const maxPrice = searchParams.maxPrice ? parseInt(searchParams.maxPrice as string) : undefined;
  const brands = searchParams.brands 
    ? Array.isArray(searchParams.brands) 
      ? searchParams.brands 
      : [searchParams.brands]
    : undefined;
  const sort = searchParams.sort as string;

  const { products, total } = await getFilteredProducts(
    categoryName,
    minPrice,
    maxPrice,
    brands,
    sort,
    page,
    limit
  );

  const availableBrands = await getBrandsForCategory(categoryName);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-[4%] py-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-black mb-4">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span>›</span>
          <span className="text-black font-medium">{categoryName}</span>
        </div>

        {/* Page title */}
        <h1 className="text-2xl font-bold mb-4 text-black">{categoryName}</h1>

        <div className="flex gap-4">
          {/* Sidebar filters */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <CategoryFilters 
              availableBrands={availableBrands}
              currentFilters={{
                minPrice,
                maxPrice,
                brands: brands || [],
                sort: sort || 'newest',
              }}
            />
          </div>

          {/* Products section */}
          <div className="flex-1">
            {/* Sort bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
              <div className="text-black">
                Hiển thị <span className="font-bold text-black">{products.length}</span> / {total} sản phẩm
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-black text-sm">Sắp xếp:</span>
                <Link 
                  href={`?sort=newest`}
                  className={`px-3 py-1 rounded-full text-sm ${!sort || sort === 'newest' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Mới nhất
                </Link>
                <Link 
                  href={`?sort=price-asc`}
                  className={`px-3 py-1 rounded-full text-sm ${sort === 'price-asc' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Giá thấp
                </Link>
                <Link 
                  href={`?sort=price-desc`}
                  className={`px-3 py-1 rounded-full text-sm ${sort === 'price-desc' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Giá cao
                </Link>
              </div>
            </div>

            {/* Products grid */}
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-black mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-black">Vui lòng thử lại với bộ lọc khác</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((product: any) => (
                  <Link 
                    key={product._id.toString()} 
                    href={`/san-pham/${product._id}`} 
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-500 transition-all group"
                  >
                    <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                      {product.images && product.images[0] ? (
                        <Image 
                          src={product.images[0]} 
                          alt={product.name} 
                          width={200} 
                          height={200} 
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="text-5xl">📱</div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm mb-2 line-clamp-2 h-10">{product.name}</h3>
                      <div className="flex items-baseline space-x-2 mb-1">
                        {(() => {
                          const displayPrice = product.originalPrice && product.originalPrice > product.price ? product.originalPrice : product.price;
                          return <p className="text-red-600 font-bold text-base">{displayPrice.toLocaleString()}₫</p>;
                        })()}
                      </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center">
                            <span className="text-yellow-400">⭐</span>
                            <span className="ml-1 text-black">{product.rating || 5}</span>
                          </div>
                          <span className="text-black">Đã bán {product.sold || 0}</span>
                        </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Link 
                  href={`?page=${page - 1}${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}${brands ? brands.map(b => `&brands=${b}`).join('') : ''}${sort ? `&sort=${sort}` : ''}`} 
                  className={`px-4 py-2 bg-white border border-gray-200 rounded-lg ${page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
                >
                  ← Trước
                </Link>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Link
                      key={pageNum}
                      href={`?page=${pageNum}${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}${brands ? brands.map(b => `&brands=${b}`).join('') : ''}${sort ? `&sort=${sort}` : ''}`}
                      className={`px-4 py-2 rounded-lg ${page === pageNum ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
                
                <Link 
                  href={`?page=${page + 1}${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}${brands ? brands.map(b => `&brands=${b}`).join('') : ''}${sort ? `&sort=${sort}` : ''}`} 
                  className={`px-4 py-2 bg-white border border-gray-200 rounded-lg ${page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
                >
                  Tiếp →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}