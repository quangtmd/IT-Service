
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Updated imports for v6/v7
import { Product } from '../../types';
import Button from '../ui/Button';
import { useCart } from '../../hooks/useCart';

interface ProductCardProps {
  product: Product;
  context?: 'preview' | 'detail-view';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, context = 'preview' }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate(); // Changed from useHistory

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const discountPercentage = product.originalPrice && product.price < product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`} className="block">
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col group border border-transparent hover:border-primary/50 hover:shadow-xl transition-all duration-300"> 
      <div className="relative overflow-hidden">
        <img
          src={(product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : `https://picsum.photos/seed/${product.id}/300/225`)}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discountPercentage > 0 && (
          <div className="absolute top-3 right-3 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPercentage}%
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-xs text-textSubtle mb-1">{product.category}</p>
        <h4 className="text-sm font-semibold text-textBase mb-2 flex-grow h-10 group-hover:text-primary transition-colors line-clamp-2" title={product.name}>
          {product.name}
        </h4>
        
        <div className="mt-2">
          <div className="flex items-baseline">
            <span className="text-lg font-bold text-primary">
              {product.price.toLocaleString('vi-VN')}₫
            </span>
            {product.originalPrice && product.price < product.originalPrice && (
              <span className="text-sm text-textSubtle line-through ml-2">
                {product.originalPrice.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>
          {product.status && context === 'detail-view' && (
             <p className={`text-xs mt-1 ${product.status === 'Mới' ? 'text-green-600' : product.status === 'Like new' ? 'text-sky-600' : 'text-amber-600'}`}>
               {product.status}
             </p>
          )}
        </div>

        {context === 'detail-view' && (
          <div className="mt-4 pt-4 border-t border-borderDefault">
            <Button onClick={handleAddToCart} size="sm" className="w-full" variant="outline" disabled={product.stock <=0}>
              <i className="fas fa-cart-plus mr-2"></i> Thêm vào giỏ
            </Button>
            {product.stock <= 0 && <p className="text-xs text-danger-text text-center font-semibold mt-2">Hết hàng</p>}
          </div>
        )}
      </div>
    </div>
    </Link>
  );
};

export default ProductCard;
