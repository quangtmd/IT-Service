
import React, { useRef, useState, MouseEvent } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const div = cardRef.current;
    const rect = div.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotateX = ((mouseY - height / 2) / height) * -20; // Max rotation deg
    const rotateY = ((mouseX - width / 2) / width) * 20;

    setRotation({ x: rotateX, y: rotateY });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setOpacity(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-200 ease-out ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1, 1, 1)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
      {/* Shine Effect */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 transition-opacity duration-200"
        style={{ 
            opacity: opacity * 0.15,
            mixBlendMode: 'overlay',
            zIndex: 10 
        }}
      />
    </div>
  );
};

export default TiltCard;
