import React from 'react';

interface ImageUploadPreviewProps {
  src: string;
  onRemove: () => void;
  alt?: string;
  className?: string;
}

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({ 
  src, 
  onRemove, 
  alt = "Preview", 
  className = "" 
}) => {
  return (
    <div className={`relative group w-24 h-24 rounded-md overflow-hidden border border-borderDefault shadow-sm ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-danger-bg text-danger-text rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-200"
        aria-label="Remove image"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default ImageUploadPreview;