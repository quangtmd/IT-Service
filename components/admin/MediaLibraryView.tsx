import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MediaItem } from '../../types';
import Button from '../ui/Button';
import { getMediaItems, addMediaItem, deleteMediaItem } from '../../services/localDataService';
import { fileToDataUrl } from '../../services/localFileService';

interface MediaLibraryViewProps {
    isModalMode?: boolean;
    onSelect?: (url: string) => void;
    onClose?: () => void;
}

const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({ isModalMode = false, onSelect, onClose }) => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadMedia = useCallback(async () => {
        setIsLoading(true);
        try {
            const items = await getMediaItems();
            setMediaItems(items);
        } catch (error) {
            console.error("Failed to load media items:", error);
            alert("Không thể tải thư viện media.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMedia();
    }, [loadMedia]);


    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setIsUploading(true);

        try {
            const uploadPromises = Array.from(files).map(async (file: File) => {
                const dataUrl = await fileToDataUrl(file);
                const newItem: Omit<MediaItem, 'id'> = {
                    url: dataUrl,
                    name: file.name,
                    type: file.type,
                    uploadedAt: new Date().toISOString(),
                };
                await addMediaItem(newItem);
            });

            await Promise.all(uploadPromises);
            await loadMedia();

        } catch (err) {
            console.error("Lỗi khi tải ảnh lên:", err);
            alert("Đã xảy ra lỗi khi tải ảnh lên.");
        } finally {
            setIsUploading(false);
            if (e.target) {
                e.target.value = ''; // Reset file input
            }
        }
    };

    const handleDelete = async (item: MediaItem) => {
        if (window.confirm("Bạn có chắc muốn xóa ảnh này?")) {
            try {
                await deleteMediaItem(item.id);
                setMediaItems(prev => prev.filter(i => i.id !== item.id));
            } catch (error) {
                console.error("Lỗi khi xóa media item:", error);
                alert("Đã xảy ra lỗi khi xóa ảnh.");
                loadMedia();
            }
        }
    };

    const handleSelectImage = (url: string) => {
        if (onSelect) {
            onSelect(url);
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            alert("Đã sao chép URL! (Lưu ý: đây là dataURL, có thể rất dài)");
        });
    };
    
    const UploadButton = ({ isModal }: { isModal: boolean }) => (
      <>
        <Button
          size="sm"
          leftIcon={<i className="fas fa-upload"></i>}
          isLoading={isUploading}
          onClick={handleUploadClick}
        >
          {isUploading ? 'Đang tải...' : (isModal ? 'Tải lên' : 'Tải lên ảnh mới')}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          aria-hidden="true"
        />
      </>
    );

    const libraryContent = (
        <>
            {isLoading ? (
                 <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                 </div>
            ) : mediaItems.length > 0 ? (
                <div className="media-library-grid">
                    {mediaItems.map(item => (
                        <div key={item.id} className="media-item-card group" onClick={() => isModalMode && handleSelectImage(item.url)}>
                            <img src={item.url} alt={item.name} />
                            <div className={`media-item-overlay ${isModalMode ? 'cursor-pointer' : ''}`}>
                                <div className="flex gap-2">
                                    {isModalMode ? (
                                        <Button size="sm" variant="primary" onClick={() => handleSelectImage(item.url)}><i className="fas fa-check-circle mr-1"></i> Chọn</Button>
                                    ) : (
                                        <>
                                            <Button size="sm" variant="ghost" className="!text-white !bg-black/50" onClick={(e) => { e.stopPropagation(); copyToClipboard(item.url); }}><i className="fas fa-copy"></i></Button>
                                            <Button size="sm" variant="ghost" className="!text-white !bg-black/50" onClick={(e) => { e.stopPropagation(); handleDelete(item); }}><i className="fas fa-trash"></i></Button>
                                        </>
                                    )}
                                </div>
                                <p className="text-white text-xs text-center mt-2 p-1 truncate w-full">{item.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-textMuted py-8 h-full">
                    <i className="fas fa-images text-5xl text-gray-300 mb-4"></i>
                    <h4 className="font-semibold text-gray-600 text-lg">Thư viện của bạn trống</h4>
                    <p className="text-sm mt-1">Hãy tải lên ảnh đầu tiên!</p>
                </div>
            )}
        </>
    );

    if (isModalMode) {
        return (
            <div className="admin-modal-overlay" onClick={onClose}>
                <div className="admin-modal-panel" onClick={e => e.stopPropagation()}>
                    <div className="admin-modal-header">
                        <h4 className="admin-modal-title">Chọn ảnh từ Thư viện</h4>
                        <UploadButton isModal={true} />
                    </div>
                    <div className="admin-modal-body">
                        {libraryContent}
                    </div>
                    <div className="admin-modal-footer">
                        <Button type="button" variant="outline" onClick={onClose}>Đóng</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Thư viện Media</h3>
                <UploadButton isModal={false} />
            </div>
            <div className="admin-card-body">
                {libraryContent}
            </div>
        </div>
    );
};

export default MediaLibraryView;
