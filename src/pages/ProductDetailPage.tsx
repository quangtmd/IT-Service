
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Product } from '@/types';
import Button from '@/components/ui/Button';
import CustomButton from '@/components/ui/CustomButton';
import { useCart } from '@/hooks/useCart';
import ProductCard from '@/components/shop/ProductCard';
import * as Constants from '@/constants';
import { getProduct, getProducts } from '@/services/localDataService';
import BackendConnectionError from '@/components/shared/BackendConnectionError'; 
import { useChatbotContext } from '@/contexts/ChatbotContext'; 
import ImageMagnifier from '@/components/ui/ImageMagnifier'; 

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { setCurrentContext } = useChatbotContext(); 

  useEffect(() => {
    if (product) {
      setCurrentContext(`Khách hàng đang xem sản phẩm: "${product.name}".`);
    }
    return () => {
      setCurrentContext(null);
    };
  }, [product, setCurrentContext]);

  useEffect(() => {
    const loadProductData = async () => {
      if (!productId) {
        setError("Không có ID sản phẩm.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const foundProduct = await getProduct(productId);

        if (foundProduct) {
          setProduct(foundProduct);
          setMainImage(foundProduct.imageUrls?.[0] || `https://source.unsplash.com/600x400/?${encodeURIComponent(foundProduct.name)}`);
          
          const query = `?subCategory=${foundProduct.subCategory}&limit=4`;
          const { products: allProducts } = await getProducts(query);
          const related = allProducts.filter(p => p.id !== foundProduct.id);
          setRelatedProducts(related);

        } else {
          setError('Không tìm thấy sản phẩm.');
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu sản phẩm từ API:", err);
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải sản phẩm.");
      } finally {
        setIsLoading(false);
        window.scrollTo(0, 0);
      }
    };

    loadProductData();
    setQuantity(1);
    setActiveTab('description');
  }, [productId]);

  const handleAddToCart = () => { if (product) addToCart(product, quantity); };
  const handleBuyNow = () => { if (product) { addToCart(product, quantity); navigate('/checkout'); } };

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8 text-center min-h-[50vh] flex flex-col justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-textMuted">Đang tải chi tiết sản phẩm...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="container mx-auto px-4 py-8">
            <BackendConnectionError error={error} />
        </div>
    );
  }
  
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

  const savings = product.originalPrice && product.originalPrice > product.price ? product.originalPrice - product.price : 0;
  const mainCategoryInfo = Constants.PRODUCT_CATEGORIES_HIERARCHY.find(mc => mc.name === product.mainCategory);

  return (
    <div className="bg-bgCanvas pb-24 md:pb-12"> 
      <div className="container mx-auto px-4 py-4 md:py-8">
        <nav aria-label="breadcrumb" className="text-xs md:text-sm text-textMuted mb-4 md:mb-6 bg-bgBase p-2 md:p-3 rounded-md border border-borderDefault overflow-x-auto whitespace-nowrap">
          <ol className="flex items-center space-x-1.5">
            <li><Link to="/" className="hover:text-primary">Trang chủ</Link></li>
            <li><span className="text-textSubtle">/</span></li>
            <li><Link to="/shop" className="hover:text-primary">Sản phẩm</Link></li>
            {mainCategoryInfo && (
              <>
                <li><span className="text-textSubtle">/</span></li>
                <li><Link to={`/shop?mainCategory=${mainCategoryInfo.slug}`} className="hover:text-primary">{mainCategoryInfo.name}</Link></li>
              </>
            )}
            <li><span className="text-textSubtle">/</span></li>
            <li className="text-textSubtle truncate max-w-[150px]" aria-current="page" title={product.name}>
                {product.name}
            </li>
          </ol>
        </nav>
        
        <div className="bg-bgBase p-0 md:p-6 rounded-lg shadow-sm md:shadow-lg border border-borderDefault overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-8">
            
            <div className="lg:col-span-2 p-4 md:p-0">
              <div className="mb-4 border border-borderDefault rounded-lg bg-white relative group flex justify-center items-center p-2 min-h-[300px] md:min-h-[400px]">
                <ImageMagnifier 
                    src={mainImage} 
                    alt={product.name} 
                    className="h-auto max-h-[300px] md:max-h-[450px] w-auto max-w-full object-contain mx-auto cursor-crosshair"
                    zoomLevel={2.5}
                />
                {savings > 0 && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow z-10">-{Math.round((savings / (product.originalPrice || 1)) * 100)}%</span>
                )}
              </div>
              {product.imageUrls && product.imageUrls.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                  {product.imageUrls.map((url, index) => (
                    <div key={index} className="snap-start flex-shrink-0">
                        <img 
                            src={url} 
                            alt={`${product.name} thumbnail ${index + 1}`} 
                            className={`w-16 h-16 md:w-20 md:h-20 object-cover rounded-md cursor-pointer border-2 transition-all ${mainImage === url ? 'border-primary opacity-100' : 'border-transparent opacity-70 hover:opacity-100 hover:border-primary/50'}`} 
                            onClick={() => setMainImage(url)} 
                        />
                    </div>
                  ))}
                </div>
              )}
               <div className="mt-4 md:mt-6 p-3 md:p-4 border border-borderDefault rounded-lg bg-bgCanvas space-y-2 md:space-y-3 hidden md:block">
                  <div className="flex items-center text-sm text-textMuted"><i className="fas fa-check-circle text-green-500 w-5 mr-2"></i>Sản phẩm chính hãng</div>
                  <div className="flex items-center text-sm text-textMuted"><i className="fas fa-truck text-blue-500 w-5 mr-2"></i>Giao hàng toàn quốc</div>
                  <div className="flex items-center text-sm text-textMuted"><i className="fas fa-shield-alt text-yellow-500 w-5 mr-2"></i>Bảo hành theo NSX</div>
              </div>
            </div>

            <div className="lg:col-span-3 p-4 md:p-0 border-t lg:border-t-0 border-borderDefault lg:border-l lg:pl-8">
              <h1 className="text-xl md:text-3xl font-bold text-textBase mb-2 md:mb-3 leading-tight">{product.name}</h1>
              <div className="flex flex-wrap items-center text-xs md:text-sm text-textMuted mb-4 space-x-3 md:space-x-4">
                  <span>Mã SP: <span className="font-medium text-textBase">{product.productCode || product.id}</span></span>
                  {product.brand && <span className="hidden sm:inline">|</span>}
                  {product.brand && <span>Thương hiệu: <span className="font-medium text-primary">{product.brand}</span></span>}
                  <span className="hidden sm:inline">|</span>
                  <div className="flex items-center">
                    <span className="text-yellow-500">{[...Array(Math.floor(product.rating || 5))].map((_, i) => <i key={`star-${i}`} className="fas fa-star text-[10px] md:text-xs"></i>)}</span>
                    <span className="text-textMuted ml-1">({product.reviews || 0} đánh giá)</span>
                  </div>
              </div>

              <div className="p-3 md:p-4 bg-bgMuted rounded-lg border border-borderDefault mb-4 md:mb-6">
                  <div className="flex items-baseline flex-wrap gap-2">
                      <span className="text-2xl md:text-3xl font-bold text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm md:text-lg text-textSubtle line-through ml-1">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}</span>
                      )}
                  </div>
                  {savings > 0 && (
                      <p className="text-xs md:text-sm text-textMuted mt-1">Tiết kiệm: <span className="font-semibold text-green-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(savings)}</span></p>
                  )}
              </div>
              
              {product.shortDescription && (
                  <div className="mb-4 p-3 md:p-4 border border-blue-200 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-1 md:mb-2 text-sm md:text-base"><i className="fas fa-info-circle mr-2"></i>Thông tin nổi bật</h3>
                      <p className="text-xs md:text-sm text-blue-900/80 leading-relaxed">{product.shortDescription}</p>
                  </div>
              )}
              
              <div className="mb-4 md:mb-6 flex items-center justify-between md:justify-start gap-4">
                  <div>
                      <span className="font-semibold text-textBase text-sm">Tình trạng: </span>
                      {product.stock > 0 ? (
                          <span className="text-green-600 font-bold text-sm"><i className="fas fa-check-circle mr-1"></i> Còn hàng</span>
                      ) : (
                          <span className="text-danger-text font-bold text-sm"><i className="fas fa-times-circle mr-1"></i> Hết hàng</span>
                      )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label htmlFor="quantity" className="font-semibold text-textBase text-sm">Số lượng:</label>
                    <div className="flex items-center border border-borderStrong rounded-md">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2 py-1 text-textMuted hover:bg-bgMuted"><i className="fas fa-minus text-xs"></i></button>
                        <input type="number" id="quantity" value={quantity} min="1" max={product.stock} onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))} className="w-10 text-center text-sm border-x border-borderStrong py-1 focus:outline-none" />
                        <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-2 py-1 text-textMuted hover:bg-bgMuted"><i className="fas fa-plus text-xs"></i></button>
                    </div>
                  </div>
              </div>

              <div className="hidden md:flex space-x-3 mb-6">
                <Button onClick={handleBuyNow} size="lg" className="flex-1 py-3" variant="primary" disabled={product.stock <=0}><i className="fas fa-bolt mr-2"></i> Mua ngay</Button>
                <Button onClick={handleAddToCart} size="lg" className="flex-1 py-3" variant="outline" disabled={product.stock <=0}><i className="fas fa-cart-plus mr-2"></i> Thêm vào giỏ</Button>
              </div>
              
               <div className="p-3 md:p-4 border border-dashed border-red-300 bg-red-50 rounded-lg">
                  <h3 className="font-bold text-red-700 mb-2 text-sm md:text-base"><i className="fas fa-gift mr-2"></i> Ưu đãi thêm</h3>
                  <ul className="list-disc list-inside text-xs md:text-sm text-red-600 space-y-1">
                      <li>Giảm thêm <strong>100.000₫</strong> khi thanh toán qua VNPay.</li>
                      <li>Tặng mã giảm giá <strong>5%</strong> cho đơn hàng tiếp theo.</li>
                      <li>Miễn phí cài đặt phần mềm & vệ sinh máy trọn đời.</li>
                  </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-10 bg-bgBase p-4 md:p-6 rounded-lg shadow-sm border border-borderDefault">
            <div className="flex border-b border-borderDefault mb-4 overflow-x-auto">
                <button onClick={() => setActiveTab('description')} className={`py-2 md:py-3 px-4 md:px-5 font-semibold text-sm md:text-base whitespace-nowrap transition-colors border-b-2 ${activeTab === 'description' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-textBase'}`}>Mô tả chi tiết</button>
                <button onClick={() => setActiveTab('specs')} className={`py-2 md:py-3 px-4 md:px-5 font-semibold text-sm md:text-base whitespace-nowrap transition-colors border-b-2 ${activeTab === 'specs' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-textBase'}`}>Thông số kỹ thuật</button>
            </div>

            <div className="min-h-[200px]">
                {activeTab === 'description' && (
                    <div className="prose prose-sm md:prose-base max-w-none text-textMuted leading-relaxed">
                        <p>{product.description}</p>
                    </div>
                )}
                {activeTab === 'specs' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-borderDefault">
                            <tbody>
                            {Object.entries(product.specifications).map(([key, value], index) => (
                                <tr key={key} className={`border-b border-borderDefault ${index % 2 === 0 ? 'bg-bgCanvas' : 'bg-bgBase'}`}>
                                    <td className="py-2 px-3 md:px-4 font-semibold text-textBase w-1/3 md:w-1/4">{key}</td>
                                    <td className="py-2 px-3 md:px-4 text-textMuted">{String(value)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-10 md:mt-16">
            <h2 className="text-xl md:text-2xl font-bold text-textBase mb-4 md:mb-6 text-center uppercase">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-borderDefault p-3 z-40 md:hidden pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.1)] flex gap-3 items-center safe-area-pb">
          <div className="flex flex-col min-w-[80px]">
              <span className="text-xs text-textMuted line-through">{product.originalPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice) : ''}</span>
              <span className="text-lg font-bold text-primary leading-none">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</span>
          </div>
          <div className="flex-grow flex gap-2">
             <CustomButton 
                onClick={handleAddToCart} 
                disabled={product.stock <= 0}
                variant="outline"
                className="flex-1"
                icon="fas fa-cart-plus"
             />
             <CustomButton 
                onClick={handleBuyNow} 
                disabled={product.stock <= 0}
                className="flex-[2]"
             >
                {product.stock > 0 ? 'Mua Ngay' : 'Hết Hàng'}
             </CustomButton>
          </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
