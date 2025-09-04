
import React, { useState, useEffect } from 'react';
import { MediaItem } from '../../types';
import * as Constants from '../../constants';
import Button from '../ui/Button';

const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; } 
    catch (e) { return defaultValue; }
};
const setLocalStorageItem = <T,>(key: string, value: T) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error(e); }
};

const MediaLibraryView: React.FC = () => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => getLocalStorageItem(Constants.MEDIA_LIBRARY_STORAGE_KEY, []));
    const [isUploading, setIsUploading] = useState(false);

    const handleUpdate = (updatedMedia: MediaItem[]) => {
        setMediaItems(updatedMedia);
        setLocalStorageItem(Constants.MEDIA_LIBRARY_STORAGE_KEY, updatedMedia);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setIsUploading(true);

        const readPromises = Array.from(files).map(file => {
            return new Promise<MediaItem>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({
                        id: `media-${Date.now()}-${Math.random()}`,
                        url: reader.result as string,
                        name: file.name,
                        type: file.type,
                        uploadedAt: new Date().toISOString(),
                    });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
        
        Promise.all(readPromises).then(newItems => {
            handleUpdate([...newItems, ...mediaItems]);
            setIsUploading(false);
        }).catch(err => {
            console.error("Lỗi khi đọc file:", err);
            setIsUploading(false);
            alert("Đã xảy ra lỗi khi tải ảnh lên.");
        });
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Bạn có chắc muốn xóa ảnh này?")) {
            handleUpdate(mediaItems.filter(item => item.id !== id));
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            alert("Đã sao chép URL!");
        });
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Thư viện Media</h3>
                <label className="inline-block">
                    {/* Fix: Removed invalid 'as' prop. The Button component does not support polymorphism. */}
                    <Button size="sm" leftIcon={<i className="fas fa-upload"></i>} isLoading={isUploading}>
                        {isUploading ? 'Đang tải...' : 'Tải lên ảnh mới'}
                    </Button>
                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
            </div>
            <div className="admin-card-body">
                {mediaItems.length > 0 ? (
                    <div className="media-library-grid">
                        {mediaItems.map(item => (
                            <div key={item.id} className="media-item-card group">
                                <img src={item.url} alt={item.name} />
                                <div className="media-item-overlay">
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" className="!text-white !bg-black/50" onClick={() => copyToClipboard(item.url)}><i className="fas fa-copy"></i></Button>
                                        <Button size="sm" variant="ghost" className="!text-white !bg-black/50" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></Button>
                                    </div>
                                    <p className="text-white text-xs text-center mt-2 p-1 truncate w-full">{item.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-textMuted py-8">Thư viện của bạn trống. Hãy tải lên ảnh đầu tiên!</p>
                )}
            </div>
        </div>
    );
};

export default MediaLibraryView;
