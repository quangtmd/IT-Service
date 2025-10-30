import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import Button from '../ui/Button';
import { useCart } from '../../hooks/useCart';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, updateQuantity, cart } = useCart();

  const cartItem = cart.find(item => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const savings = product.originalPrice && product.price < product.originalPrice ? product.originalPrice - product.price : 0;
  
  const discountPercentage = product.originalPrice && product.price < product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  
  const hasDiscount = savings > 0;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };
  
  const handleIncrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleDecrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantityInCart > 0) {
      // FIX: Convert product.id to string to match the expected type of updateQuantity.
      updateQuantity(String(product.id), quantityInCart - 1);
    }
  };


  const handleWishlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    alert(`Đã thêm "${product.name}" vào danh sách yêu thích!`);
  };

  // Get first two specifications for the highlight box
  const specHighlights = Object.entries(product.specs || {}).slice(0, 2);

  return (
    <Link to={`/product/${product.id}`} className="block h-full">
      <div className="bg-white rounded-md overflow-hidden h-full flex flex-col group border-2 border-primary/40 hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="p-4 border-b border-gray-200">
          <img
            src={(product.images && product.images.length > 0 ? product.images[0] : `https://source.unsplash.com/300x225/?${encodeURIComponent(product.name)}`)}
            alt={product.name}
            className="w-full h-40 object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          {hasDiscount && (
            <div className="w-fit bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-md mb-3 shadow-sm">
              TIẾT KIỆM {savings.toLocaleString('vi-VN')}₫
            </div>
          )}

          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-gray-500 uppercase font-semibold">{product.brand}</p>
            <button onClick={handleWishlistClick} className="text-gray-400 hover:text-primary transition-colors" aria-label="Thêm vào danh sách yêu thích">
              <i className="far fa-heart text-xl"></i>
            </button>
          </div>

          <h4 className="text-base font-medium text-textBase mb-2 flex-grow min-h-[2.5rem] group-hover:text-primary transition-colors line-clamp-2" title={product.name}>
            {product.name}
          </h4>
          
          <div className="mt-auto space-y-3">
            <div>
              <span className="text-xl font-bold text-primary">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
              {hasDiscount && product.originalPrice && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  <span className="text-textSubtle line-through">
                    {product.originalPrice.toLocaleString('vi-VN')}₫
                  </span>
                  <span className="font-semibold text-red-600">
                    -{discountPercentage}%
                  </span>
                </div>
              )}
            </div>

            {specHighlights.length > 0 && (
              <div className="bg-gray-100 rounded-md p-2 text-xs text-gray-600 space-y-1 border border-gray-200">
                {specHighlights.map(([key, value]) => (
                   <p key={key} className="truncate" title={`${key}: ${value}`}>
                     <i className="fas fa-microchip mr-2 text-gray-400"></i>
                     <span className="font-medium text-gray-800">{key}:</span> {value}
                   </p>
                ))}
              </div>
            )}
            
            <div className="h-[42px]"> {/* Fixed height container to prevent layout shift */}
              {quantityInCart > 0 ? (
                <div className="flex items-center justify-between w-full border border-primary rounded-lg h-full">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDecrement} 
                    className="!text-primary !rounded-r-none h-full !px-4"
                    aria-label={`Giảm số lượng ${product.name}`}
                  >
                    <i className="fas fa-minus"></i>
                  </Button>
                  <span className="font-bold text-primary text-lg px-2" aria-live="polite">
                    {quantityInCart}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleIncrement} 
                    className="!text-primary !rounded-l-none h-full !px-4"
                    disabled={product.stock <= quantityInCart}
                    aria-label={`Tăng số lượng ${product.name}`}
                  >
                    <i className="fas fa-plus"></i>
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full h-full text-sm"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <i className="fas fa-cart-plus mr-2"></i>
                  {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                </Button>
              )}
            </div>

          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;