import React, { useState } from 'react';
import { HomepageWhyChooseUsSettings, HomepageWhyChooseUsFeature } from '../../../types';
import Button from '../../ui/Button';
import ImageUploadInput from '../../ui/ImageUploadInput';

interface WhyChooseUsSettingsFormProps {
    settings: HomepageWhyChooseUsSettings;
    onChange: (newSettings: HomepageWhyChooseUsSettings) => void;
}

const WhyChooseUsSettingsForm: React.FC<WhyChooseUsSettingsFormProps> = ({ settings, onChange }) => {
    const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>(null);

    const handleFieldChange = (field: keyof Omit<HomepageWhyChooseUsSettings, 'features'>, value: any) => {
        onChange({ ...settings, [field]: value });
    };

    const handleFeatureChange = (id: string, field: keyof HomepageWhyChooseUsFeature, value: string) => {
        const newFeatures = settings.features.map(f => f.id === id ? { ...f, [field]: value } : f);
        onChange({ ...settings, features: newFeatures });
    };

    const addFeature = () => {
        const newFeature: HomepageWhyChooseUsFeature = {
            id: `wcu-feat-${Date.now()}`,
            iconClass: 'fas fa-star',
            title: 'Tính năng mới',
            description: 'Mô tả cho tính năng mới.'
        };
        onChange({ ...settings, features: [...settings.features, newFeature] });
        setExpandedFeatureId(newFeature.id);
    };

    const deleteFeature = (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa tính năng này?')) {
            onChange({ ...settings, features: settings.features.filter(f => f.id !== id) });
        }
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="admin-form-group"><label>Tiêu đề phụ</label><input type="text" value={settings.preTitle || ''} onChange={e => handleFieldChange('preTitle', e.target.value)} /></div>
                <div className="admin-form-group"><label>Tiêu đề chính</label><input type="text" value={settings.title} onChange={e => handleFieldChange('title', e.target.value)} /></div>
                <div className="admin-form-group md:col-span-2"><label>Mô tả</label><textarea rows={3} value={settings.description} onChange={e => handleFieldChange('description', e.target.value)} /></div>
                <div className="md:col-span-2">
                    <ImageUploadInput label="URL Ảnh chính" value={settings.mainImageUrl} onChange={value => handleFieldChange('mainImageUrl', value)} />
                </div>
                <div className="admin-form-group"><label>Con số kinh nghiệm (VD: 10+)</label><input type="text" value={settings.experienceStatNumber || ''} onChange={e => handleFieldChange('experienceStatNumber', e.target.value)} /></div>
                <div className="admin-form-group"><label>Nhãn kinh nghiệm (VD: Năm kinh nghiệm)</label><input type="text" value={settings.experienceStatLabel || ''} onChange={e => handleFieldChange('experienceStatLabel', e.target.value)} /></div>
                <div className="admin-form-group"><label>Nút liên hệ - Chữ</label><input type="text" value={settings.contactButtonText} onChange={e => handleFieldChange('contactButtonText', e.target.value)} /></div>
                <div className="admin-form-group"><label>Nút liên hệ - Link</label><input type="text" value={settings.contactButtonLink} onChange={e => handleFieldChange('contactButtonLink', e.target.value)} /></div>
                <div className="admin-form-group-checkbox items-center"><input type="checkbox" checked={settings.enabled} onChange={e => handleFieldChange('enabled', e.target.checked)} id="wcu_enabled"/><label htmlFor="wcu_enabled" className="!mb-0 !ml-2">Hiển thị khối này</label></div>
            </div>

            <div className="admin-form-subsection-title mt-6">Quản lý các Điểm mạnh</div>
            <div className="flex justify-end mb-4"><Button onClick={addFeature} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Điểm mạnh</Button></div>
            <div className="space-y-3">
                {settings.features.map(feature => (
                    <div key={feature.id} className="border border-borderDefault rounded-lg bg-gray-50/50">
                        <div className="p-3 flex items-center justify-between bg-white rounded-t-lg border-b">
                            <button onClick={() => setExpandedFeatureId(expandedFeatureId === feature.id ? null : feature.id)} className="flex items-center gap-3 flex-grow text-left">
                                <i className={`fas fa-chevron-right transition-transform ${expandedFeatureId === feature.id ? 'rotate-90' : ''}`}></i>
                                <span className="font-semibold">{feature.title}</span>
                            </button>
                            <Button onClick={() => deleteFeature(feature.id)} size="sm" variant="ghost" className="!text-red-500 hover:!bg-red-50 !px-2"><i className="fas fa-trash-alt"></i></Button>
                        </div>
                        {expandedFeatureId === feature.id && (
                             <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="admin-form-group"><label>Icon (lớp FontAwesome)</label><input type="text" value={feature.iconClass} onChange={e => handleFeatureChange(feature.id, 'iconClass', e.target.value)} /></div>
                                <div className="admin-form-group"><label>Tiêu đề</label><input type="text" value={feature.title} onChange={e => handleFeatureChange(feature.id, 'title', e.target.value)} /></div>
                                <div className="admin-form-group md:col-span-2"><label>Mô tả</label><textarea rows={2} value={feature.description} onChange={e => handleFeatureChange(feature.id, 'description', e.target.value)}></textarea></div>
                             </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default WhyChooseUsSettingsForm;
