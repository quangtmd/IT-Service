import React, { useState } from 'react';
import Button from './Button';
import MediaLibraryView from '../admin/MediaLibraryView';
import ImageUploadPreview from './ImageUploadPreview';

interface ImageUploadInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPreview?: boolean;
}

const ImageUploadInput: React.FC<ImageUploadInputProps> = ({ label, value, onChange, showPreview = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageSelect = (url: string) => {
    onChange(url);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="admin-form-group">
        <label>{label}</label>
        {showPreview && value && (
            <div className="mb-2">
                <ImageUploadPreview src={value} onRemove={() => onChange('')} />
            </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Dán URL hoặc chọn từ thư viện"
            className="flex-grow"
          />
          <Button type="button" variant="outline" onClick={() => setIsModalOpen(true)}>
            <i className="fas fa-photo-video mr-2"></i> Thư viện
          </Button>
        </div>
      </div>
      {isModalOpen && (
        <MediaLibraryView
          isModalMode={true}
          onSelect={handleImageSelect}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default ImageUploadInput;
