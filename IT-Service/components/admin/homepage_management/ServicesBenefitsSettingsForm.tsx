import React, { useState } from 'react';
import { HomepageServicesBenefitsSettings, HomepageServiceBenefit } from '../../../types';
import Button from '../../ui/Button';

interface ServicesBenefitsSettingsFormProps {
    settings: HomepageServicesBenefitsSettings;
    onChange: (newSettings: HomepageServicesBenefitsSettings) => void;
}

const ServicesBenefitsSettingsForm: React.FC<ServicesBenefitsSettingsFormProps> = ({ settings, onChange }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleFieldChange = (field: keyof Omit<HomepageServicesBenefitsSettings, 'benefits'>, value: any) => {
        onChange({ ...settings, [field]: value });
    };

    const handleBenefitChange = (id: string, field: keyof HomepageServiceBenefit, value: any) => {
        const newBenefits = settings.benefits.map(b => b.id === id ? { ...b, [field]: value } : b);
        onChange({ ...settings, benefits: newBenefits });
    };

    const handleAddBenefit = () => {
        const newBenefit: HomepageServiceBenefit = {
            id: `benefit-${Date.now()}`,
            iconClass: 'fas fa-star',
            title: 'Lợi ích mới',
            description: 'Mô tả ngắn gọn cho lợi ích mới này.',
            link: '/services',
            order: settings.benefits.length > 0 ? Math.max(...settings.benefits.map(b => b.order)) + 1 : 1,
        };
        onChange({ ...settings, benefits: [...settings.benefits, newBenefit] });
        setExpandedId(newBenefit.id);
    };

    const handleDeleteBenefit = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lợi ích này không?')) {
            onChange({ ...settings, benefits: settings.benefits.filter(b => b.id !== id) });
        }
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newBenefits = [...settings.benefits].sort((a,b) => a.order - b.order);
        const item = newBenefits[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newBenefits.length) return;

        newBenefits[index] = newBenefits[swapIndex];
        newBenefits[swapIndex] = item;
        
        const reorderedBenefits = newBenefits.map((b, idx) => ({ ...b, order: idx + 1 }));
        onChange({ ...settings, benefits: reorderedBenefits });
    };
    
    const sortedBenefits = [...settings.benefits].sort((a,b) => a.order - b.order);

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="admin-form-group"><label>Tiêu đề phụ</label><input type="text" value={settings.preTitle || ''} onChange={e => handleFieldChange('preTitle', e.target.value)} /></div>
                <div className="admin-form-group"><label>Tiêu đề chính</label><input type="text" value={settings.title || ''} onChange={e => handleFieldChange('title', e.target.value)} /></div>
                <div className="admin-form-group-checkbox items-center"><input type="checkbox" checked={settings.enabled} onChange={e => handleFieldChange('enabled', e.target.checked)} id="benefits_enabled"/><label htmlFor="benefits_enabled" className="!mb-0 !ml-2">Hiển thị khối này</label></div>
            </div>

            <div className="admin-form-subsection-title mt-6">Quản lý các Lợi ích</div>
            <div className="flex justify-end mb-4"><Button onClick={handleAddBenefit} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Lợi ích</Button></div>

            <div className="space-y-3">
                {sortedBenefits.map((benefit, index) => (
                    <div key={benefit.id} className="border border-borderDefault rounded-lg bg-gray-50/50">
                        <div className="p-3 flex items-center justify-between bg-white rounded-t-lg border-b">
                            <button onClick={() => setExpandedId(expandedId === benefit.id ? null : benefit.id)} className="flex items-center gap-3 flex-grow text-left">
                                <i className={`fas fa-chevron-right transition-transform ${expandedId === benefit.id ? 'rotate-90' : ''}`}></i>
                                <span className="font-semibold">{benefit.title}</span>
                            </button>
                             <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                    <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="disabled:opacity-20 text-xs p-0.5"><i className="fas fa-angle-up"></i></button>
                                    <button onClick={() => handleMove(index, 'down')} disabled={index === sortedBenefits.length - 1} className="disabled:opacity-20 text-xs p-0.5"><i className="fas fa-angle-down"></i></button>
                                </div>
                                <Button onClick={() => handleDeleteBenefit(benefit.id)} size="sm" variant="ghost" className="!text-red-500 hover:!bg-red-50 !px-2"><i className="fas fa-trash-alt"></i></Button>
                            </div>
                        </div>
                        {expandedId === benefit.id && (
                             <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="admin-form-group"><label>Icon (lớp FontAwesome)</label><input type="text" value={benefit.iconClass} onChange={e => handleBenefitChange(benefit.id, 'iconClass', e.target.value)} /></div>
                                <div className="admin-form-group"><label>Tiêu đề</label><input type="text" value={benefit.title} onChange={e => handleBenefitChange(benefit.id, 'title', e.target.value)} /></div>
                                <div className="admin-form-group md:col-span-2"><label>Mô tả</label><textarea rows={3} value={benefit.description} onChange={e => handleBenefitChange(benefit.id, 'description', e.target.value)}></textarea></div>
                                <div className="admin-form-group md:col-span-2"><label>Link chi tiết</label><input type="text" value={benefit.link} onChange={e => handleBenefitChange(benefit.id, 'link', e.target.value)} /></div>
                             </div>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
};

export default ServicesBenefitsSettingsForm;