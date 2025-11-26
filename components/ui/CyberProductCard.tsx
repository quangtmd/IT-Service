
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
    <SpotlightCard 
      className="!p-0 h-full flex flex-col group bg-slate-900/40 border-slate-800/60 hover:border-cyan-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] rounded-2xl overflow-hidden"
      spotlightColor="rgba(6, 182, 212, 0.15)"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-black/50">
        <img
          src={product.imageUrls?.[0] || `https://source.unsplash.com/300x225/?tech,computer,${product.id}`}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80"></div>

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.stock <= 0 ? (
                 <span className="px-2.5 py-1 rounded-md bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg">
                    Hết hàng
                 </span>
            ) : product.originalPrice && product.price < product.originalPrice ? (
                <span className="px-2.5 py-1 rounded-md bg-green-500/20 border border-green-500/50 text-green-400 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg">
                    Giảm giá
                </span>
            ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow relative z-10">
        <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest border border-cyan-500/20 px-2 py-0.5 rounded bg-cyan-950/30">
                {product.brand || 'IQ TECH'}
            </span>
             {/* Fake Tech Decor */}
            <div className="flex gap-1">
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse"></div>
            </div>
        </div>

        <Link to={`/product/${product.id}`} className="block mb-3 group-hover:text-cyan-300 transition-colors">
            <h3 className="text-lg font-bold text-white leading-snug line-clamp-2 min-h-[3rem]" title={product.name}>
            {product.name}
            </h3>
        </Link>
        
        {/* Specs / Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
            {product.tags?.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/5 text-gray-400 group-hover:border-cyan-500/20 transition-colors">
                    {tag}
                </span>
            ))}
        </div>

        <div className="mt-auto pt-4 border-t border-white/5 flex items-end justify-between">
          <div className="flex flex-col">
             {product.originalPrice && product.price < product.originalPrice && (
                <span className="text-xs text-gray-500 line-through mb-0.5 font-mono">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}
                </span>
             )}
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 font-sans tracking-tight shadow-cyan-500/50 drop-shadow-sm">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
            </span>
          </div>
          
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            size="sm"
            className={`!p-0 !w-10 !h-10 rounded-full flex items-center justify-center transition-all duration-300 group/btn ${product.stock > 0 ? 'bg-cyan-500 text-white hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            title="Thêm vào giỏ hàng"
          >
            <i className="fas fa-cart-plus text-sm transition-transform group-hover/btn:scale-110"></i>
          </Button>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default CyberProductCard;
