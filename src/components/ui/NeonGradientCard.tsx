
import React from 'react';

interface NeonGradientCardProps {
  children: React.ReactNode;
  className?: string;
}

const NeonGradientCard: React.FC<NeonGradientCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`relative group rounded-xl bg-gray-900 ${className}`}>
      {/* Animated Border */}
      <div 
        className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-75 blur-[1px] group-hover:opacity-100 group-hover:blur-[2px] transition-all duration-500"
        style={{ zIndex: 0 }}
      ></div>
      
      {/* Inner Content */}
      <div className="relative h-full w-full rounded-xl bg-gray-950 p-6 z-10">
        {children}
      </div>
    </div>
  );
};

export default NeonGradientCard;
