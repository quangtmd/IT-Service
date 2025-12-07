import React, { useState } from 'react';

interface ImageMagnifierProps {
  src: string;
  alt?: string;
  className?: string;
  magnifierHeight?: number;
  magnifierWidth?: number;
  zoomLevel?: number;
}

const ImageMagnifier: React.FC<ImageMagnifierProps> = ({
  src,
  alt = '',
  className = '',
  magnifierHeight = 150,
  magnifierWidth = 150,
  zoomLevel = 2.5
}) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [[x, y], setXY] = useState([0, 0]);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const handleMouseEnter = (e: React.MouseEvent<HTMLImageElement>) => {
    const elem = e.currentTarget;
    const { width, height } = elem.getBoundingClientRect();
    setImgSize({ width, height });
    setShowMagnifier(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const elem = e.currentTarget;
    const { top, left } = elem.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    setXY([x, y]);
  };

  return (
    <div className="relative inline-block">
      <img
        src={src}
        alt={alt}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowMagnifier(false)}
      />

      <div
        style={{
          display: showMagnifier ? 'block' : 'none',
          position: 'absolute',
          pointerEvents: 'none',
          height: `${magnifierHeight}px`,
          width: `${magnifierWidth}px`,
          top: `${y - magnifierHeight / 2}px`,
          left: `${x - magnifierWidth / 2}px`,
          opacity: '1',
          border: '1px solid lightgray',
          backgroundColor: 'white',
          backgroundImage: `url('${src}')`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${imgSize.width * zoomLevel}px ${imgSize.height * zoomLevel}px`,
          backgroundPositionX: `${-x * zoomLevel + magnifierWidth / 2}px`,
          backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`,
          zIndex: 50,
          borderRadius: '50%',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}
      />
    </div>
  );
};

export default ImageMagnifier;