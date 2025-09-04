
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import Button from '../ui/Button';
import { useCart } from '../../hooks/useCart';

interface ProductCardProps {
  product: Product;
  context?: 'preview' | 'detail-view'; // Keep context for potential future use, but styling is now unified.
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const discountPercentage = product.originalPrice && product.price < product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const hasDiscount = discountPercentage > 0;
  const isBestSeller = product.tags && product.tags.includes('Bán chạy');
  
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };


  return (
    <Link to={`/product/${product.id}`} className="block h-full">
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col group border border-gray-200 hover:border-primary/50 hover:shadow-xl transition-all duration-300 p-2.5">
        <div className="relative overflow-hidden rounded-md">
          <img
            src={(product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : `https://picsum.photos/seed/${product.id}/300/225`)}
            alt={product.name}
            className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1">
            {isBestSeller && <span className="text-xs bg-amber-400 text-black font-semibold px-2 py-0.5 rounded">Bán chạy</span>}
            {hasDiscount && !isBestSeller && <span className="text-xs bg-primary text-white font-semibold px-2 py-0.5 rounded">Khuyến mãi</span>}
          </div>
          {discountPercentage > 0 && (
            <div className="absolute top-1.5 right-1.5 bg-red-600 text-white text-xs font-bold w-10 h-10 flex items-center justify-center rounded-full border-2 border-white shadow-md">
              -{discountPercentage}%
            </div>
          )}
        </div>
        
        <div className="pt-3 px-1 flex flex-col flex-grow">
          <h4 className="text-sm font-semibold text-textBase mb-2 flex-grow h-10 group-hover:text-primary transition-colors line-clamp-2" title={product.name}>
            {product.name}
          </h4>
          
          <div className="mt-auto">
            <div className="flex flex-col items-start mb-2">
              {product.originalPrice && product.price < product.originalPrice && (
                <span className="text-xs text-textSubtle line-through">
                  {product.originalPrice.toLocaleString('vi-VN')}₫
                </span>
              )}
              <span className="text-lg font-bold text-red-600">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
            </div>
            
            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-start items-center h-8">
              <span className="text-sm font-bold text-gray-700">{product.brand}</span>
            </div>
            <div className="mt-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs py-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors duration-200" 
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
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
