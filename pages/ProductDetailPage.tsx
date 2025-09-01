
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../data/mockData';
import { Product } from '../types';
import Button from '../components/ui/Button';
import { useCart } from '../hooks/useCart';
import ProductCard from '../components/shop/ProductCard';
import * as Constants from '../constants';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string>('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const foundProduct = MOCK_PRODUCTS.find(p => p.id === productId);
    setProduct(foundProduct || null);
    if (foundProduct && foundProduct.imageUrls && foundProduct.imageUrls.length > 0) {
      setMainImage(foundProduct.imageUrls[0]);
    } else if (foundProduct) {
      setMainImage(`https://picsum.photos/seed/${foundProduct.id}/600/400`);
    }
    setQuantity(1);
    window.scrollTo(0,0);
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      navigate('/cart');
    }
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-semibold text-textBase">Không tìm thấy sản phẩm</h2>
        <Link to="/shop" className="text-primary hover:underline mt-4 inline-block">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const relatedProducts = MOCK_PRODUCTS.filter(p => p.subCategory === product.subCategory && p.id !== product.id && p.mainCategory !== "PC Xây Dựng").slice(0, 4);

  const discountPercentage = product.originalPrice && product.price < product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const mainCategoryInfo = Constants.PRODUCT_CATEGORIES_HIERARCHY.find(mc => mc.name === product.mainCategory);
  const subCategoryInfo = mainCategoryInfo?.subCategories.find(sc => sc.name === product.subCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-bgBase p-6 md:p-8 rounded-lg shadow-xl border border-borderDefault">
        {/* --- BREADCRUMB NAVIGATION --- */}
        <nav aria-label="breadcrumb" className="text-sm text-textMuted mb-6">
          <ol className="flex items-center space-x-1.5 flex-wrap">
            <li><Link to="/" className="hover:text-primary">Trang chủ</Link></li>
            <li><span className="text-textSubtle">/</span></li>
            <li><Link to="/shop" className="hover:text-primary">Sản phẩm</Link></li>
            {mainCategoryInfo && (
              <>
                <li><span className="text-textSubtle">/</span></li>
                <li><Link to={`/shop?mainCategory=${mainCategoryInfo.slug}`} className="hover:text-primary">{mainCategoryInfo.name}</Link></li>
              </>
            )}
            {subCategoryInfo && (
              <>
                <li><span className="text-textSubtle">/</span></li>
                <li><Link to={`/shop?mainCategory=${mainCategoryInfo?.slug}&subCategory=${subCategoryInfo.slug}`} className="hover:text-primary">{subCategoryInfo.name}</Link></li>
              </>
            )}
            <li><span className="text-textSubtle">/</span></li>
            <li className="text-textSubtle truncate max-w-[200px] sm:max-w-xs" aria-current="page" title={product.name}>
                {product.name}
            </li>
          </ol>
        </nav>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div>
            <div className="mb-4 border border-borderDefault rounded-lg overflow-hidden shadow-md">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-auto object-contain max-h-[400px] md:max-h-[500px]"
              />
            </div>
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {product.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${mainImage === url ? 'border-primary' : 'border-borderDefault hover:border-primary/50'}`}
                    onClick={() => setMainImage(url)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-textBase mb-2">{product.name}</h1>
            <p className="text-sm text-textMuted mb-1">Mã SP: <span className="font-medium text-textBase">{product.id}</span></p>
            {product.brand && <p className="text-sm text-textMuted mb-2">Thương hiệu: <span className="font-medium text-textBase">{product.brand}</span></p>}

            <div className="mb-4">
                <span className="text-yellow-500">
                  {[...Array(Math.floor(product.rating || 4))].map((_, i) => <i key={`star-${i}`} className="fas fa-star"></i>)}
                  {(product.rating || 4) % 1 !== 0 && <i className="fas fa-star-half-alt"></i>}
                  {[...Array(5 - Math.ceil(product.rating || 4))].map((_, i) => <i key={`empty-star-${i}`} className="far fa-star"></i>)}
                </span>
              <span className="text-textMuted ml-2 text-sm">({product.reviews || Math.floor(Math.random() * 200) + 10} đánh giá)</span>
            </div>

            <div className="mb-4">
                <span className="text-3xl font-bold text-primary">
                {product.price.toLocaleString('vi-VN')}₫
                </span>
                {product.originalPrice && product.price < product.originalPrice && (
                <span className="ml-3">
                    <span className="text-lg text-textSubtle line-through">
                    {product.originalPrice.toLocaleString('vi-VN')}₫
                    </span>
                    {discountPercentage > 0 && (
                    <span className="ml-2 text-sm font-semibold text-white bg-primary px-2 py-0.5 rounded-md">
                        -{discountPercentage}%
                    </span>
                    )}
                </span>
                )}
            </div>

            {product.status && (
             <p className={`text-md font-semibold mb-4 ${product.status === 'Mới' ? 'text-green-600' : product.status === 'Like new' ? 'text-sky-600' : 'text-amber-600'}`}>
               Tình trạng: {product.status} (Còn {product.stock} sản phẩm)
             </p>
            )}

            <div className="flex items-center mb-6 space-x-3">
              <label htmlFor="quantity" className="font-semibold text-textMuted">Số lượng:</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                min="1"
                max={product.stock > 0 ? product.stock : 10}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 bg-white border border-borderStrong text-textBase rounded-md p-2 text-center focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
              <Button onClick={handleAddToCart} size="lg" className="w-full sm:w-auto" variant="outline" disabled={product.stock <=0}>
                <i className="fas fa-cart-plus mr-2"></i> Thêm vào giỏ hàng
              </Button>
              <Button onClick={handleBuyNow} size="lg" className="w-full sm:w-auto" variant="primary" disabled={product.stock <=0}>
                Mua ngay
              </Button>
            </div>
            {product.stock <= 0 && <p className="text-danger-text mt-2 font-semibold">Hết hàng</p>}
            {product.stock > 0 && product.stock < 5 && <p className="text-warning-text mt-2">Chỉ còn {product.stock} sản phẩm</p>}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-borderDefault">
            <h3 className="text-2xl font-semibold text-textBase mb-4">Mô tả chi tiết sản phẩm</h3>
            <div className="prose prose-sm max-w-none text-textMuted leading-relaxed">
                <p>{product.description}</p>
            </div>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-textBase mb-4">Thông số kỹ thuật</h3>
          {Object.keys(product.specifications).length > 0 ? (
            <div className="space-y-2 text-textMuted bg-bgMuted p-4 rounded-md">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 py-1.5 border-b border-borderDefault last:border-b-0">
                  <strong className="sm:col-span-1 text-textBase font-medium">{key}:</strong>
                  <span className="sm:col-span-2">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-textMuted">Chưa có thông số kỹ thuật chi tiết cho sản phẩm này.</p>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-borderDefault">
            <h3 className="text-2xl font-semibold text-textBase mb-4">Đánh giá & Bình luận</h3>
            <p className="text-textMuted">Tính năng bình luận và đánh giá sắp ra mắt. Hãy quay lại sau!</p>
        </div>

        <div className="mt-10 pt-6 border-t border-borderDefault grid md:grid-cols-2 gap-6">
            <div>
                <h4 className="text-xl font-semibold text-textBase mb-2"><i className="fas fa-truck mr-2 text-primary"></i> Chính sách giao hàng</h4>
                <ul className="list-disc list-inside text-textMuted text-sm space-y-1 pl-2">
                    <li>Giao hàng miễn phí toàn quốc cho đơn hàng từ 500.000đ.</li>
                    <li>Thời gian giao hàng dự kiến: 2-5 ngày làm việc.</li>
                    <li>Hỗ trợ COD (thanh toán khi nhận hàng).</li>
                </ul>
            </div>
            <div>
                <h4 className="text-xl font-semibold text-textBase mb-2"><i className="fas fa-shield-alt mr-2 text-primary"></i> Bảo hành – Đổi trả</h4>
                <ul className="list-disc list-inside text-textMuted text-sm space-y-1 pl-2">
                    <li>Bảo hành chính hãng theo tiêu chuẩn nhà sản xuất (thường 12-36 tháng).</li>
                    <li>Đổi mới trong 7 ngày đầu nếu có lỗi từ nhà sản xuất.</li>
                    <li>Chi tiết điều kiện bảo hành xem tại trang Chính sách.</li>
                </ul>
            </div>
            <div>
                <h4 className="text-xl font-semibold text-textBase mb-2"><i className="fas fa-headset mr-2 text-primary"></i> Chính sách hỗ trợ</h4>
                <ul className="list-disc list-inside text-textMuted text-sm space-y-1 pl-2">
                    <li>Thanh toán: COD, Chuyển khoản, Momo/VNPay QR.</li>
                    <li>Hỗ trợ kỹ thuật miễn phí qua Hotline/Zalo.</li>
                    <li>Hướng dẫn cài đặt & sử dụng từ xa.</li>
                </ul>
            </div>
        </div>

      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-textBase mb-6 text-center">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
