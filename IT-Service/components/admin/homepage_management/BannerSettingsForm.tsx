import React, { useState } from 'react';
import { HomepageBannerSettings } from '../../../types';
import Button from '../../ui/Button';
import ImageUploadInput from '../../ui/ImageUploadInput';

interface BannerSettingsFormProps {
    banners: HomepageBannerSettings[];
    onChange: (newBanners: HomepageBannerSettings[]) => void;
}

const BannerSettingsForm: React.FC<BannerSettingsFormProps> = ({ banners, onChange }) => {
    const [expandedId, setExpandedId] = useState<string | null>(banners[0]?.id || null);

    const handleBannerChange = (id: string, field: keyof HomepageBannerSettings, value: any) => {
        const newBanners = banners.map(b => b.id === id ? { ...b, [field]: value } : b);
        onChange(newBanners);
    };

    const handleAddBanner = () => {
        const newBanner: HomepageBannerSettings = {
            id: `banner-${Date.now()}`,
            title: 'Tiêu đề Banner Mới',
            subtitle: 'Mô tả ngắn cho banner mới.',
            preTitle: 'TIÊU ĐỀ PHỤ',
            backgroundImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=1920&auto=format&fit=crop',
            primaryButtonText: 'Xem thêm',
            primaryButtonLink: '/shop',
            isActive: true,
            order: banners.length > 0 ? Math.max(...banners.map(b => b.order)) + 1 : 1,
        };
        onChange([...banners, newBanner]);
        setExpandedId(newBanner.id);
    };

    const handleDeleteBanner = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa banner này không?')) {
            onChange(banners.filter(b => b.id !== id));
        }
    };
    
    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newBanners = [...banners];
        const item = newBanners[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newBanners.length) return;

        // Swap items
        newBanners[index] = newBanners[swapIndex];
        newBanners[swapIndex] = item;
        
        // Re-assign order based on new position
        const reorderedBanners = newBanners.map((b, idx) => ({ ...b, order: idx + 1 }));

        onChange(reorderedBanners);
    };


    const sortedBanners = [...banners].sort((a,b) => a.order - b.order);

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={handleAddBanner} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Thêm Banner mới
                </Button>
            </div>
            <div className="space-y-3">
                {sortedBanners.map((banner, index) => (
                    <div key={banner.id} className="border border-borderDefault rounded-lg bg-gray-50/50">
                        <div className="p-3 flex items-center justify-between bg-white rounded-t-lg border-b">
                            <button onClick={() => setExpandedId(expandedId === banner.id ? null : banner.id)} className="flex items-center gap-3 flex-grow text-left">
                                <i className={`fas fa-chevron-right transition-transform ${expandedId === banner.id ? 'rotate-90' : ''}`}></i>
                                <span className="font-semibold">{banner.title || 'Banner mới'}</span>
                            </button>
                            <div className="flex items-center gap-2">
                                <label className="flex items-center text-xs text-textMuted cursor-pointer">
                                    <input type="checkbox" checked={banner.isActive} onChange={e => handleBannerChange(banner.id, 'isActive', e.target.checked)} className="mr-1.5"/>
                                    Hiện
                                </label>
                                <div className="flex flex-col">
                                    <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="disabled:opacity-20 text-xs p-0.5"><i className="fas fa-angle-up"></i></button>
                                    <button onClick={() => handleMove(index, 'down')} disabled={index === sortedBanners.length - 1} className="disabled:opacity-20 text-xs p-0.5"><i className="fas fa-angle-down"></i></button>
                                </div>
                                <Button onClick={() => handleDeleteBanner(banner.id)} size="sm" variant="ghost" className="!text-red-500 hover:!bg-red-50 !px-2"><i className="fas fa-trash-alt"></i></Button>
                            </div>
                        </div>
                        {expandedId === banner.id && (
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="admin-form-group"><label>Tiêu đề phụ</label><input type="text" value={banner.preTitle || ''} onChange={e => handleBannerChange(banner.id, 'preTitle', e.target.value)} /></div>
                                <div className="admin-form-group"><label>Tiêu đề chính</label><input type="text" value={banner.title} onChange={e => handleBannerChange(banner.id, 'title', e.target.value)} /></div>
                                <div className="admin-form-group md:col-span-2"><label>Mô tả</label><textarea rows={3} value={banner.subtitle} onChange={e => handleBannerChange(banner.id, 'subtitle', e.target.value)} className="text-sm"></textarea></div>
                                
                                <div className="md:col-span-2">
                                    <ImageUploadInput label="URL Ảnh nền" value={banner.backgroundImageUrl} onChange={value => handleBannerChange(banner.id, 'backgroundImageUrl', value)} />
                                </div>
                                <ImageUploadInput label="URL Ảnh trang trí (trên, trái)" value={banner.decorTopLeftImageUrl || ''} onChange={value => handleBannerChange(banner.id, 'decorTopLeftImageUrl', value)} />
                                <ImageUploadInput label="URL Ảnh trang trí (dưới, phải)" value={banner.decorBottomRightImageUrl || ''} onChange={value => handleBannerChange(banner.id, 'decorBottomRightImageUrl', value)} />
                                
                                <div className="admin-form-group"><label>Nút chính - Chữ</label><input type="text" value={banner.primaryButtonText} onChange={e => handleBannerChange(banner.id, 'primaryButtonText', e.target.value)} /></div>
                                <div className="admin-form-group"><label>Nút chính - Link</label><input type="text" value={banner.primaryButtonLink} onChange={e => handleBannerChange(banner.id, 'primaryButtonLink', e.target.value)} /></div>
                                
                                <div className="admin-form-group"><label>Nút phụ - Chữ</label><input type="text" value={banner.secondaryButtonText || ''} onChange={e => handleBannerChange(banner.id, 'secondaryButtonText', e.target.value)} /></div>
                                <div className="admin-form-group"><label>Nút phụ - Link</label><input type="text" value={banner.secondaryButtonLink || ''} onChange={e => handleBannerChange(banner.id, 'secondaryButtonLink', e.target.value)} /></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BannerSettingsForm;
