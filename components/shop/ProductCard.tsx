import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import Button from '../ui/Button';
import { useCart } from '../../hooks/useCart';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const discountPercentage = product.originalPrice && product.price < product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const getDisplayName = (product: Product): string => {
    if (!product.name || !product.subCategory) {
      return product.name;
    }
    const subCategoryPrefix = product.subCategory.split('(')[0].trim();
    if (product.name.startsWith(subCategoryPrefix) && product.name.length > subCategoryPrefix.length) {
      return product.name.substring(subCategoryPrefix.length).trim();
    }
    return product.name;
  };
  const displayName = getDisplayName(product);


  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  // More robust image fallback logic
  const imageQuery = encodeURIComponent(product.category || product.brand || product.name || 'tech');
  const imageSrc = (product.imageUrls && product.imageUrls.length > 0) 
    ? product.imageUrls[0] 
    : `https://source.unsplash.com/300x225/?${imageQuery}`;

  return (
    <Link to={`/product/${product.id}`} className="block h-full group">
      <div className="bg-bgBase rounded-lg shadow-md overflow-hidden h-full flex flex-col border border-borderDefault hover:border-primary/50 hover:shadow-xl transition-all duration-300 p-2.5">
        <div className="relative overflow-hidden rounded-md">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105 bg-bgMuted"
          />
          {discountPercentage > 0 && (
            <div className="absolute top-1.5 right-1.5 bg-red-600 text-white text-xs font-bold w-10 h-10 flex items-center justify-center rounded-full border-2 border-white shadow-md">
              -{discountPercentage}%
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
            {product.tags?.includes('Bán chạy') && (
              <span className="text-xs bg-amber-400 text-black font-semibold px-2 py-0.5 rounded">Bán chạy</span>
            )}
            {(product.tags?.includes('Khuyến mãi') || discountPercentage > 0) && !product.tags?.includes('Bán chạy') && (
              <span className="text-xs bg-primary text-white font-semibold px-2 py-0.5 rounded">Khuyến mãi</span>
            )}
          </div>
        </div>
        
        <div className="pt-3 px-1 flex flex-col flex-grow">
          {/* Use min-height to ensure alignment but allow wrapping */}
          <h4 className="text-sm font-semibold text-textBase mb-2 flex-grow min-h-[40px] group-hover:text-primary transition-colors line-clamp-2" title={product.name}>
            {displayName}
          </h4>
          
          <div className="mt-auto">
            {/* Use min-height to ensure price alignment */}
            <div className="flex flex-col items-start mb-2 min-h-[44px] justify-center">
              {product.originalPrice && product.price < product.originalPrice && (
                <span className="text-xs text-textSubtle line-through">
                  {product.originalPrice.toLocaleString('vi-VN')}₫
                </span>
              )}
              <span className="text-lg font-bold text-red-500">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
            </div>
            
            {/* Use min-height to ensure brand alignment */}
            <div className="mt-2 pt-2 border-t border-borderDefault flex justify-start items-center min-h-[32px]">
              <span className="text-sm font-bold text-textMuted">{product.brand || 'Khác'}</span>
            </div>
            
            <div className="mt-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs py-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors duration-200" 
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    aria-label={`Thêm ${product.name} vào giỏ`}
                >
                    <i className="fas fa-cart-plus mr-1.5"></i>
                    {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;