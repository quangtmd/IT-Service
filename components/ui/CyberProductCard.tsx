
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
      className="!p-0 h-full flex flex-col group bg-slate-900/60 border-slate-800 hover:border-cyan-400 transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] rounded-2xl overflow-hidden z-10 hover:z-20 relative"
      spotlightColor="rgba(6, 182, 212, 0.25)"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-black/50">
        <img
          src={product.imageUrls?.[0] || `https://source.unsplash.com/300x225/?tech,computer,${product.id}`}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay Gradient - Stronger on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
            {product.stock <= 0 ? (
                 <span className="px-2.5 py-1 rounded-md bg-red-500/80 border border-red-400 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg">
                    Hết hàng
                 </span>
            ) : product.originalPrice && product.price < product.originalPrice ? (
                <span className="px-2.5 py-1 rounded-md bg-cyan-500/80 border border-cyan-400 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                    Giảm giá
                </span>
            ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow relative z-10">
        <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest border border-cyan-500/30 px-2 py-0.5 rounded bg-cyan-950/50 group-hover:bg-cyan-500/20 transition-colors">
                {product.brand || 'IQ TECH'}
            </span>
             {/* Fake Tech Decor - Animates on hover */}
            <div className="flex gap-1">
                <div className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-cyan-400 transition-colors delay-75"></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-cyan-400 transition-colors delay-150"></div>
                <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse group-hover:bg-white"></div>
            </div>
        </div>

        <Link to={`/product/${product.id}`} className="block mb-3 group-hover:text-cyan-300 transition-colors">
            <h3 className="text-lg font-bold text-white leading-snug line-clamp-2 min-h-[3rem] group-hover:text-shadow-cyan" title={product.name}>
            {product.name}
            </h3>
        </Link>
        
        {/* Specs / Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
            {product.tags?.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400 group-hover:border-cyan-500/40 group-hover:text-cyan-100 transition-colors">
                    {tag}
                </span>
            ))}
        </div>

        <div className="mt-auto pt-4 border-t border-white/10 group-hover:border-cyan-500/30 transition-colors flex items-end justify-between">
          <div className="flex flex-col">
             {product.originalPrice && product.price < product.originalPrice && (
                <span className="text-xs text-gray-500 line-through mb-0.5 font-mono">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}
                </span>
             )}
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 font-sans tracking-tight drop-shadow-sm group-hover:from-cyan-200 group-hover:to-white transition-all">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
            </span>
          </div>
          
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            size="sm"
            className={`!p-0 !w-10 !h-10 rounded-full flex items-center justify-center transition-all duration-300 group/btn 
                ${product.stock > 0 
                    ? 'bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.8)] hover:scale-110' 
                    : 'bg-slate-800 border-2 border-slate-700 text-slate-500 cursor-not-allowed'}`}
            title="Thêm vào giỏ hàng"
          >
            <i className="fas fa-cart-plus text-sm"></i>
          </Button>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default CyberProductCard;
