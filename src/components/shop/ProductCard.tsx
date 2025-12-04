
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import Button from '../ui/Button';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../contexts/ToastContext';

interface ProductCardProps {
  product: Product;
  context?: 'preview' | 'detail-view'; 
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { success } = useToast();

  const discountPercentage = product.originalPrice && product.price < product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const hasDiscount = discountPercentage > 0;
  const isBestSeller = product.tags && product.tags.includes('Bán chạy');
  
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  return (
    <Link to={`/product/${product.id}`} className="block h-full group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-200 hover:border-primary/50 transition-all duration-300 h-full flex flex-col overflow-hidden relative">
        
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={(product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : `https://source.unsplash.com/300x225/?${encodeURIComponent(product.name)}`)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {isBestSeller && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-black px-2 py-1 rounded shadow-sm">
                Bán chạy
              </span>
            )}
            {hasDiscount && !isBestSeller && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-white px-2 py-1 rounded shadow-sm">
                Sale
              </span>
            )}
          </div>

          {/* Discount Bubble */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              -{discountPercentage}%
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Brand & Rating */}
          <div className="flex justify-between items-center mb-2">
             <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate max-w-[60%]">{product.brand || 'No Brand'}</span>
             <div className="flex items-center gap-1">
                <i className="fas fa-star text-yellow-400 text-[10px]"></i>
                <span className="text-xs text-gray-500 font-medium">{product.rating || 5} ({product.reviews || 0})</span>
             </div>
          </div>

          {/* Title */}
          <h3 className="text-sm md:text-base font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]" title={product.name}>
            {product.name}
          </h3>

          {/* Bottom: Price & Action */}
          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-end justify-between mb-3">
                <div className="flex flex-col">
                    {product.originalPrice && product.price < product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through mb-0.5">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}
                        </span>
                    )}
                    <span className="text-lg font-bold text-red-600 leading-none">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </span>
                </div>
            </div>

            <Button 
                variant="outline" 
                size="sm" 
                className={`w-full py-2 text-xs font-bold uppercase tracking-wide transition-all duration-300
                    ${product.stock > 0 
                        ? 'group-hover:bg-primary group-hover:text-white group-hover:border-primary' 
                        : 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200'}
                `}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
            >
                {product.stock > 0 ? (
                    <>
                        <i className="fas fa-cart-plus mr-2"></i> Thêm vào giỏ
                    </>
                ) : (
                    'Hết hàng'
                )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
