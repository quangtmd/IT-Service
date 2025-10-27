import React, { useState } from 'react';
import { HomepageBrandLogosSettings, HomepageBrandLogo } from '../../../types';
import Button from '../../ui/Button';
import MediaLibraryView from '../MediaLibraryView';

interface BrandLogosSettingsFormProps {
    settings: HomepageBrandLogosSettings;
    onChange: (newSettings: HomepageBrandLogosSettings) => void;
}

const BrandLogosSettingsForm: React.FC<BrandLogosSettingsFormProps> = ({ settings, onChange }) => {
    const [modalTargetId, setModalTargetId] = useState<string | null>(null);

    const handleEnabledChange = (value: boolean) => {
        onChange({ ...settings, enabled: value });
    };

    const handleLogoChange = (id: string, field: keyof HomepageBrandLogo, value: string) => {
        const newLogos = settings.logos.map(l => l.id === id ? { ...l, [field]: value } : l);
        onChange({ ...settings, logos: newLogos });
    };
    
    const handleAdd = () => {
        const newItem: HomepageBrandLogo = {
            id: `logo-${Date.now()}`, name: 'Tên đối tác', logoUrl: '',
            order: settings.logos.length > 0 ? Math.max(...settings.logos.map(l => l.order)) + 1 : 1,
        };
        onChange({ ...settings, logos: [...settings.logos, newItem] });
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa logo này?')) {
            onChange({ ...settings, logos: settings.logos.filter(l => l.id !== id) });
        }
    };
    
    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newItems = [...settings.logos].sort((a,b) => a.order - b.order);
        const item = newItems[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newItems.length) return;
        newItems[index] = newItems[swapIndex]; newItems[swapIndex] = item;
        onChange({ ...settings, logos: newItems.map((l, idx) => ({ ...l, order: idx + 1 })) });
    };
    
    const handleImageSelect = (url: string) => {
        if (modalTargetId) {
            handleLogoChange(modalTargetId, 'logoUrl', url);
        }
        setModalTargetId(null);
    };
    
    const sortedLogos = [...settings.logos].sort((a,b) => a.order - b.order);

    return (
        <div>
            <div className="admin-form-group-checkbox items-center mb-6">
                <input type="checkbox" checked={settings.enabled} onChange={e => handleEnabledChange(e.target.checked)} id="logos_enabled"/>
                <label htmlFor="logos_enabled" className="!mb-0 !ml-2">Hiển thị khối Đối tác</label>
            </div>
            <div className="flex justify-end mb-4"><Button onClick={handleAdd} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Logo</Button></div>
            <div className="space-y-3">
                {sortedLogos.map((logo, index) => (
                    <div key={logo.id} className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                        <div className="flex flex-col">
                             <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="disabled:opacity-20 text-xs p-1"><i className="fas fa-angle-up"></i></button>
                             <button onClick={() => handleMove(index, 'down')} disabled={index === sortedLogos.length - 1} className="disabled:opacity-20 text-xs p-1"><i className="fas fa-angle-down"></i></button>
                        </div>
                        <img src={logo.logoUrl || `https://picsum.photos/seed/${logo.id}/100/50`} alt={logo.name} className="w-24 h-12 object-contain bg-white border rounded" />
                        <div className="admin-form-group flex-grow !mb-0"><label className="sr-only">Tên</label><input type="text" value={logo.name} onChange={e => handleLogoChange(logo.id, 'name', e.target.value)} placeholder="Tên đối tác" /></div>
                        <div className="admin-form-group flex-grow !mb-0">
                            <label className="sr-only">URL</label>
                            <div className="flex items-center gap-2">
                                <input type="text" value={logo.logoUrl} onChange={e => handleLogoChange(logo.id, 'logoUrl', e.target.value)} placeholder="URL Logo" className="flex-grow"/>
                                <Button type="button" variant="outline" size="sm" onClick={() => setModalTargetId(logo.id)}><i className="fas fa-photo-video"></i></Button>
                            </div>
                        </div>
                        <Button onClick={() => handleDelete(logo.id)} size="sm" variant="ghost" className="!text-red-500 hover:!bg-red-50"><i className="fas fa-trash"></i></Button>
                    </div>
                ))}
            </div>
            {modalTargetId && (
                <MediaLibraryView 
                    isModalMode={true}
                    onSelect={handleImageSelect}
                    onClose={() => setModalTargetId(null)}
                />
            )}
        </div>
    );
};

export default BrandLogosSettingsForm;
