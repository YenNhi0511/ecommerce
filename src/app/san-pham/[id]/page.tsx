import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import AddToCartButton from '@/components/AddToCartButton';

interface PageProps {
  params: { id: string };
}

async function getProduct(id: string) {
  await dbConnect();
  const product = await Product.findById(id).lean();
  return product;
}

async function getRelatedProducts(category: string, currentId: string) {
  await dbConnect();
  const products = await Product.find({
    category,
    _id: { $ne: currentId },
    isActive: true
  }).limit(4).lean();
  return products;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.id as string);

  if (!product) {
    notFound();
  }

  const prod = product as any;
  const relatedProducts = await getRelatedProducts(prod.category, prod._id.toString());

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span>›</span>
          <Link href={`/danh-muc/${prod.category}`} className="hover:text-blue-600 capitalize">{prod.category}</Link>
          <span>›</span>
          <span className="text-gray-800 line-clamp-1">{prod.name}</span>
        </div>

        {/* Main product section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images gallery */}
            <div className="space-y-3">
              <div className="aspect-square bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden group">
                {prod.images && prod.images[0] ? (
                  <Image 
                    src={prod.images[0]} 
                    alt={prod.name} 
                    width={500} 
                    height={500} 
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" 
                  />
                ) : (
                  <div className="text-8xl">📱</div>
                )}
              </div>
              {prod.images && prod.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {prod.images.slice(0, 5).map((image: string, index: number) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded border-2 border-gray-200 hover:border-blue-500 cursor-pointer flex items-center justify-center overflow-hidden transition">
                      <Image 
                        src={image} 
                        alt={`${prod.name} ${index + 1}`} 
                        width={100} 
                        height={100} 
                        className="object-cover w-full h-full" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="space-y-4">
              <div>
                <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full mb-3">
                  {prod.brand || 'Chính hãng'}
                </span>
                <h1 className="text-2xl font-bold mb-3 leading-tight">{prod.name}</h1>
                <div className="flex items-center space-x-4 text-sm mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400">⭐</span>
                    <span className="ml-1 font-medium">{prod.rating || 5}</span>
                    <span className="ml-1 text-gray-500">({prod.reviews || 0} đánh giá)</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <span className="text-gray-600">Đã bán {prod.sold || 0}</span>
                </div>
              </div>

              {/* Price section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-baseline space-x-3 mb-2">
                  {(() => {
                    const displayPrice = prod.originalPrice && prod.originalPrice > prod.price ? prod.originalPrice : prod.price;
                    return (
                      <span className="text-3xl font-bold text-red-600">{displayPrice.toLocaleString()}₫</span>
                    );
                  })()}
                </div>
                <div className="text-sm text-gray-600">
                  {prod.stock > 0 ? `Tồn kho: ${prod.stock}` : 'Hết hàng'}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Mô tả sản phẩm</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{prod.description}</p>
              </div>

              {/* Features */}
              {prod.features && prod.features.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Tính năng nổi bật</h3>
                  <ul className="space-y-2">
                    {prod.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <span className="text-green-500 mr-2 mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-3 pt-4">
                <AddToCartButton product={prod} />
                <WishlistButton productId={prod._id} />
                <Link 
                  href="/gio-hang" 
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-orange-600 transition text-center"
                >
                  Mua ngay
                </Link>
              </div>

              {/* Policies */}
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-3 gap-4 text-xs text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl mb-1">🚚</div>
                    <span className="text-gray-600">Giao hàng miễn phí</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-2xl mb-1">↩️</div>
                    <span className="text-gray-600">Đổi trả trong 7 ngày</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-2xl mb-1">✓</div>
                    <span className="text-gray-600">Bảo hành chính hãng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {prod.specifications && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-xl font-bold mb-4">Thông số kỹ thuật</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(prod.specifications).map(([key, value]) => (
                <div key={key} className="flex border-b border-gray-100 py-3">
                  <span className="font-medium text-gray-700 w-1/2">{key}</span>
                  <span className="text-gray-600 w-1/2">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-xl font-bold mb-4">Đánh giá sản phẩm</h2>
          <ReviewSection productId={prod._id.toString()} />
        </div>

        {/* Related products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {relatedProducts.map((relProd: any) => (
              <Link
                key={relProd._id.toString()}
                href={`/san-pham/${relProd._id}`}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-500 transition group"
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  {relProd.images?.[0] ? (
                    <Image
                      src={relProd.images[0]}
                      alt={relProd.name}
                      width={200}
                      height={200}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-5xl">📱</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-2 line-clamp-2 h-10">{relProd.name}</h3>
                  <div className="flex items-baseline space-x-2 mb-1">
                    {(() => {
                      const displayPrice = relProd.originalPrice && relProd.originalPrice > relProd.price ? relProd.originalPrice : relProd.price;
                      return <p className="text-red-600 font-bold text-base">{displayPrice.toLocaleString()}₫</p>;
                    })()}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="ml-1 text-gray-600">{relProd.rating || 5}</span>
                    </div>
                    <span className="text-gray-400">Đã bán {relProd.sold || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Import at top
import ReviewSection from '@/components/ReviewSection';
import WishlistButton from '@/components/WishlistButton';