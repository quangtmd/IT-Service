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

  const renderStars = (rating: number = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="fas fa-star text-yellow-400 text-[10px]"></i>);
      } else if (i - 0.5 === rating) {
        stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400 text-[10px]"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-gray-300 text-[10px]"></i>);
      }
    }
    return stars;
  };

  const ratingValue = product.rating || 5; 
  const reviewCount = product.reviews || 0;

  return (
    <Link to={`/product/${product.id}`} className="block h-full group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-2xl border border-gray-200 hover:border-primary/40 transition-all duration-300 h-full flex flex-col overflow-hidden relative transform hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={(product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : `https://source.unsplash.com/300x225/?${encodeURIComponent(product.name)}`)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {isBestSeller && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-black px-2 py-1 rounded shadow-sm">
                Bán chạy
              </span>
            )}
            {hasDiscount && !isBestSeller && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-white px-2 py-1 rounded shadow-sm">
                Giảm {discountPercentage}%
              </span>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate mb-1">
             {product.brand || 'IQ TECH'}
          </div>

          <h3 className="text-sm md:text-base font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]" title={product.name}>
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mb-3">
            <div className="flex gap-0.5">
                {renderStars(ratingValue)}
            </div>
            <span className="text-xs text-gray-400 ml-1">({reviewCount})</span>
          </div>

          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <div className="flex flex-col">
                {product.originalPrice && product.price < product.originalPrice && (
                    <span className="text-xs text-gray-400 line-through font-mono">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}
                    </span>
                )}
                <span className="text-lg font-bold text-red-600 leading-none">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </span>
            </div>

            <Button 
                variant="outline" 
                size="sm" 
                className={`!p-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group/btn border-primary text-primary hover:bg-primary hover:text-white ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400' : ''}`}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                title={product.stock > 0 ? "Thêm vào giỏ" : "Hết hàng"}
            >
                <i className="fas fa-cart-plus"></i>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
