import React from 'react';
import { HomepageCallToActionSettings } from '../../../types';
import ImageUploadInput from '../../ui/ImageUploadInput';

interface CallToActionSettingsFormProps {
    settings: HomepageCallToActionSettings;
    onChange: (newSettings: HomepageCallToActionSettings) => void;
}

const CallToActionSettingsForm: React.FC<CallToActionSettingsFormProps> = ({ settings, onChange }) => {
    const handleFieldChange = (field: keyof HomepageCallToActionSettings, value: any) => {
        onChange({ ...settings, [field]: value });
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="admin-form-group md:col-span-2">
                    <label>Tiêu đề chính</label>
                    <input type="text" value={settings.title} onChange={e => handleFieldChange('title', e.target.value)} />
                </div>
                <div className="admin-form-group md:col-span-2">
                    <label>Mô tả</label>
                    <textarea rows={4} value={settings.description} onChange={e => handleFieldChange('description', e.target.value)} />
                </div>
                <div className="admin-form-group">
                    <label>Nút bấm - Chữ</label>
                    <input type="text" value={settings.buttonText} onChange={e => handleFieldChange('buttonText', e.target.value)} />
                </div>
                <div className="admin-form-group">
                    <label>Nút bấm - Link</label>
                    <input type="text" value={settings.buttonLink} onChange={e => handleFieldChange('buttonLink', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                    <ImageUploadInput label="URL Ảnh nền (tùy chọn)" value={settings.backgroundImageUrl || ''} onChange={value => handleFieldChange('backgroundImageUrl', value)} />
                </div>
                <div className="admin-form-group-checkbox items-center">
                    <input type="checkbox" checked={settings.enabled} onChange={e => handleFieldChange('enabled', e.target.checked)} id="cta_enabled"/>
                    <label htmlFor="cta_enabled" className="!mb-0 !ml-2">Hiển thị khối này</label>
                </div>
            </div>
        </div>
    );
};

export default CallToActionSettingsForm;
