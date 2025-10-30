import React, { useEffect, useState } from 'react';
// FIX: Using wildcard import for react-router-dom to handle potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { Product } from '../types';
import Button from '../components/ui/Button';
import { useCart } from '../hooks/useCart';
import ProductCard from '../components/shop/ProductCard';
import { getProduct, getProducts } from '../services/localDataService';
import RecentlyViewedProducts from '../components/shop/RecentlyViewedProducts';

const ProductDetailPage: React.FC = () => {
  const { productId } = ReactRouterDOM.useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const { addToCart } = useCart();
  const navigate = ReactRouterDOM.useNavigate();

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
          setMainImage(foundProduct.images?.[0] || `https://source.unsplash.com/600x400/?${encodeURIComponent(foundProduct.name)}`);
          
          // Fetch related products based on the same category
          const allProducts = await getProducts();
          // FIX: Property 'categoryId' does not exist on type 'Product'. Did you mean 'category_id'?
          const related = allProducts.filter(p => p.category_id === foundProduct.category_id && p.id !== foundProduct.id).slice(0, 4);
          setRelatedProducts(related);

          // Track recently viewed
          const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';
          const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
          let recentlyViewed: string[] = stored ? JSON.parse(stored) : [];
          recentlyViewed = [productId, ...recentlyViewed.filter(id => String(id) !== String(productId))].slice(0, 5);
          localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));

        } else {
          setError('Không tìm thấy sản phẩm.');
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu sản phẩm:", err);
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không mong muốn khi tải sản phẩm.");
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
        <div className="container mx-auto px-4 py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-textMuted">Đang tải chi tiết sản phẩm...</p>
        </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-semibold text-textBase">{error || 'Không tìm thấy sản phẩm'}</h2>
        <ReactRouterDOM.Link to="/shop" className="text-primary hover:underline mt-4 inline-block">
          Quay lại cửa hàng
        </ReactRouterDOM.Link>
      </div>
    );
  }

  const savings = product.originalPrice && product.originalPrice > product.price ? product.originalPrice - product.price : 0;

  return (
    <div className="bg-bgCanvas">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Recently Viewed Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0 order-2 lg:order-1">
                <RecentlyViewedProducts currentProductId={String(product.id)} />
            </aside>
            
            <main className="flex-grow min-w-0 order-1 lg:order-2">
                <nav aria-label="breadcrumb" className="text-sm text-textMuted mb-6 bg-bgBase p-3 rounded-md border border-borderDefault">
                  <ol className="flex items-center space-x-1.5 flex-wrap">
                    <li><ReactRouterDOM.Link to="/home" className="hover:text-primary">Trang chủ</ReactRouterDOM.Link></li>
                    <li><span className="text-textSubtle">/</span></li>
                    <li><ReactRouterDOM.Link to="/shop" className="hover:text-primary">Sản phẩm</ReactRouterDOM.Link></li>
                    {/* FIX: Property 'categoryId' does not exist on type 'Product'. Did you mean 'category_id'? */}
                    {product.category_id && product.categoryName && (
                      <>
                        <li><span className="text-textSubtle">/</span></li>
                        {/* FIX: Property 'categoryId' does not exist on type 'Product'. Did you mean 'category_id'? */}
                        <li><ReactRouterDOM.Link to={`/shop?categoryId=${product.category_id}`} className="hover:text-primary">{product.categoryName}</ReactRouterDOM.Link></li>
                      </>
                    )}
                    <li><span className="text-textSubtle">/</span></li>
                    <li className="text-textSubtle" aria-current="page" title={product.name}>
                        {product.name}
                    </li>
                  </ol>
                </nav>
                
                <div className="bg-bgBase p-4 md:p-6 rounded-lg shadow-lg border border-borderDefault">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2">
                      <div className="mb-4 border border-borderDefault rounded-lg overflow-hidden shadow-md sticky top-24">
                        <img src={mainImage} alt={product.name} className="w-full h-auto object-contain max-h-[450px]" />
                      </div>
                      {product.images && product.images.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                          {product.images.map((url, index) => (
                            <img key={index} src={url} alt={`${product.name} thumbnail ${index + 1}`} className={`flex-shrink-0 w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${mainImage === url ? 'border-primary' : 'border-borderDefault hover:border-primary/50'}`} onClick={() => setMainImage(url)} />
                          ))}
                        </div>
                      )}
                       <div className="mt-6 p-4 border border-borderDefault rounded-lg bg-bgCanvas space-y-3">
                          <div className="flex items-center text-sm text-textMuted"><i className="fas fa-check-circle text-green-500 w-5 mr-2"></i>Sản phẩm chính hãng</div>
                          <div className="flex items-center text-sm text-textMuted"><i className="fas fa-truck text-blue-500 w-5 mr-2"></i>Giao hàng toàn quốc</div>
                          <div className="flex items-center text-sm text-textMuted"><i className="fas fa-shield-alt text-yellow-500 w-5 mr-2"></i>Bảo hành theo NSX</div>
                      </div>
                    </div>

                    <div className="lg:col-span-3">
                      <h1 className="text-2xl md:text-3xl font-bold text-textBase mb-3">{product.name}</h1>
                      <div className="flex items-center text-sm text-textMuted mb-3 space-x-4">
                          <span>Mã SP: <span className="font-medium text-textBase">{product.id}</span></span>
                          {product.brand && <span>Thương hiệu: <span className="font-medium text-textBase">{product.brand}</span></span>}
                      </div>

                      <div className="p-4 bg-bgMuted rounded-lg border border-borderDefault mb-4">
                          <div className="flex items-baseline mb-1">
                              <span className="text-3xl font-bold text-primary">{product.price.toLocaleString('vi-VN')}₫</span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="text-lg text-textSubtle line-through ml-3">{product.originalPrice.toLocaleString('vi-VN')}₫</span>
                              )}
                          </div>
                          {savings > 0 && (
                              <p className="text-sm text-textMuted">Tiết kiệm: <span className="font-semibold text-primary">{savings.toLocaleString('vi-VN')}₫</span></p>
                          )}
                      </div>
                      
                      <div className="mb-4">
                          <span className="font-semibold text-textBase">Tình trạng: </span>
                          {product.stock > 0 ? (
                              <span className="text-green-600 font-bold"><i className="fas fa-check-circle mr-1"></i> Còn hàng</span>
                          ) : (
                              <span className="text-danger-text font-bold"><i className="fas fa-times-circle mr-1"></i> Hết hàng</span>
                          )}
                      </div>

                      <div className="flex items-center mb-6 space-x-3">
                        <label htmlFor="quantity" className="font-semibold text-textBase">Số lượng:</label>
                        <input type="number" id="quantity" value={quantity} min="1" max={product.stock > 0 ? product.stock : 10} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-20 bg-white border border-borderStrong text-textBase rounded-md p-2 text-center focus:ring-primary focus:border-primary" />
                      </div>

                      <div className="space-y-3 mb-6">
                        <Button onClick={handleBuyNow} size="lg" className="w-full text-lg py-3.5" variant="primary" disabled={product.stock <=0}><i className="fas fa-bolt mr-2"></i> Mua ngay</Button>
                        <Button onClick={handleAddToCart} size="lg" className="w-full text-lg py-3.5" variant="outline" disabled={product.stock <=0}><i className="fas fa-cart-plus mr-2"></i> Thêm vào giỏ hàng</Button>
                      </div>
                      
                       <div className="p-4 border-2 border-dashed border-red-300 bg-red-50 rounded-lg">
                          <h3 className="font-bold text-red-700 mb-2"><i className="fas fa-gift mr-2"></i> Khuyến mãi đặc biệt</h3>
                          <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                              <li>Giảm thêm 100.000₫ khi thanh toán qua VNPay.</li>
                              <li>Tặng kèm chuột không dây và túi chống sốc.</li>
                              <li>Miễn phí cài đặt phần mềm cơ bản.</li>
                          </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 bg-bgBase p-4 md:p-6 rounded-lg shadow-lg border border-borderDefault">
                    <div className="flex border-b border-borderDefault">
                        <button onClick={() => setActiveTab('description')} className={`product-detail-tab ${activeTab === 'description' ? 'active' : ''}`}>Mô tả chi tiết</button>
                        <button onClick={() => setActiveTab('specs')} className={`product-detail-tab ${activeTab === 'specs' ? 'active' : ''}`}>Thông số kỹ thuật</button>
                        <button onClick={() => setActiveTab('reviews')} className={`product-detail-tab ${activeTab === 'reviews' ? 'active' : ''}`}>Đánh giá & Bình luận</button>
                    </div>

                    {activeTab === 'description' && (
                        <div className="prose prose-base max-w-none text-textMuted leading-relaxed pt-6">
                            <p>{product.description}</p>
                        </div>
                    )}
                    {activeTab === 'specs' && (
                        <div className="overflow-x-auto pt-6">
                            {product.specs && Object.keys(product.specs).length > 0 ? (
                                <table className="product-detail-specs-table">
                                    <tbody>
                                        {Object.entries(product.specs).map(([key, value]) => (
                                            <tr key={key}>
                                                <td>{key}</td>
                                                <td>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-textMuted">Thông số kỹ thuật cho sản phẩm này đang được cập nhật.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div className="pt-6">
                           <p className="text-textMuted">Tính năng đánh giá đang được phát triển.</p>
                        </div>
                    )}
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
            </main>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;