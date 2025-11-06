import React, { useState } from 'react';
import { HomepageAboutSettings, HomepageAboutFeature } from '../../../types';
import Button from '../../ui/Button';
import ImageUploadInput from '../../ui/ImageUploadInput';

interface AboutSettingsFormProps {
    about: HomepageAboutSettings;
    onChange: (newSettings: HomepageAboutSettings) => void;
}

const AboutSettingsForm: React.FC<AboutSettingsFormProps> = ({ about, onChange }) => {
    const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>(null);

    const handleFieldChange = (field: keyof Omit<HomepageAboutSettings, 'features'>, value: any) => {
        onChange({ ...about, [field]: value });
    };

    const handleFeatureChange = (id: string, field: keyof HomepageAboutFeature, value: string) => {
        const newFeatures = about.features.map(f => f.id === id ? { ...f, [field]: value } : f);
        onChange({ ...about, features: newFeatures });
    };

    const addFeature = () => {
        const newFeature: HomepageAboutFeature = {
            id: `feat-${Date.now()}`,
            icon: 'fas fa-star',
            title: 'Tính năng mới',
            description: 'Mô tả cho tính năng mới.'
        };
        const newFeatures = [...about.features, newFeature];
        onChange({ ...about, features: newFeatures });
        setExpandedFeatureId(newFeature.id);
    };

    const deleteFeature = (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa tính năng này?')) {
            const newFeatures = about.features.filter(f => f.id !== id);
            onChange({ ...about, features: newFeatures });
        }
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="admin-form-group"><label>Tiêu đề phụ</label><input type="text" value={about.preTitle || ''} onChange={e => handleFieldChange('preTitle', e.target.value)} /></div>
                <div className="admin-form-group"><label>Tiêu đề chính</label><input type="text" value={about.title} onChange={e => handleFieldChange('title', e.target.value)} /></div>
                <div className="admin-form-group md:col-span-2"><label>Mô tả</label><textarea rows={4} value={about.description} onChange={e => handleFieldChange('description', e.target.value)} /></div>
                
                <ImageUploadInput label="URL Ảnh chính" value={about.imageUrl} onChange={value => handleFieldChange('imageUrl', value)} />
                <ImageUploadInput label="URL Ảnh chi tiết (nhỏ)" value={about.imageDetailUrl || ''} onChange={value => handleFieldChange('imageDetailUrl', value)} />

                <div className="admin-form-group"><label>Nút bấm - Chữ</label><input type="text" value={about.buttonText} onChange={e => handleFieldChange('buttonText', e.target.value)} /></div>
                <div className="admin-form-group"><label>Nút bấm - Link</label><input type="text" value={about.buttonLink} onChange={e => handleFieldChange('buttonLink', e.target.value)} /></div>
                 <div className="admin-form-group-checkbox items-center"><input type="checkbox" checked={about.enabled} onChange={e => handleFieldChange('enabled', e.target.checked)} id="about_enabled"/><label htmlFor="about_enabled" className="!mb-0 !ml-2">Hiển thị khối này</label></div>
            </div>

            <div className="admin-form-subsection-title mt-6">Quản lý Tính năng nổi bật</div>
            <div className="flex justify-end mb-4"><Button onClick={addFeature} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Tính năng</Button></div>
            <div className="space-y-3">
                {about.features.map(feature => (
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
                                <div className="admin-form-group"><label>Icon (lớp FontAwesome)</label><input type="text" value={feature.icon} onChange={e => handleFeatureChange(feature.id, 'icon', e.target.value)} /></div>
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

export default AboutSettingsForm;
