
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../contexts/ToastContext';
import SpotlightCard from './SpotlightCard';
import Button from './Button';

interface CyberProductCardProps {
  product: Product;
}

const CyberProductCard: React.FC<CyberProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { success } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  return (
    <SpotlightCard className="!p-4 h-full flex flex-col group bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4 bg-black/50">
        <img
          src={product.imageUrls?.[0] || `https://source.unsplash.com/300x225/?tech,${product.id}`}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.stock <= 0 && (
                 <span className="px-2 py-1 rounded bg-red-500/20 border border-red-500/50 text-red-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                    Hết hàng
                 </span>
            )}
             {product.originalPrice && product.price < product.originalPrice && (
                <span className="px-2 py-1 rounded bg-green-500/20 border border-green-500/50 text-green-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                    Sale
                </span>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow">
        <div className="mb-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{product.brand || 'IQ TECH'}</span>
        </div>
        <Link to={`/product/${product.id}`} className="block mb-2">
            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-cyan-300 transition-colors line-clamp-2" title={product.name}>
            {product.name}
            </h3>
        </Link>
        
        {/* Specs / Tags Mockup */}
        <div className="flex flex-wrap gap-1 mb-4">
            {product.tags?.slice(0, 2).map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-gray-400">
                    {tag}
                </span>
            ))}
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
             {product.originalPrice && product.price < product.originalPrice && (
                <span className="text-xs text-gray-500 line-through mb-0.5">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}
                </span>
             )}
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
            </span>
          </div>
          
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            size="sm"
            className={`!p-2 !w-10 !h-10 rounded-full flex items-center justify-center transition-all duration-300 ${product.stock > 0 ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-white border border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:scale-110' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
          >
            <i className="fas fa-cart-plus"></i>
          </Button>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default CyberProductCard;
