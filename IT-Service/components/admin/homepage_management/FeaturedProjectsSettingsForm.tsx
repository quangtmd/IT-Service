import React from 'react';
import { HomepageFeaturedProjectsSettings } from '../../../types';
import Button from '../../ui/Button';

interface FeaturedProjectsSettingsFormProps {
    settings: HomepageFeaturedProjectsSettings;
    onChange: (newSettings: HomepageFeaturedProjectsSettings) => void;
}

const FeaturedProjectsSettingsForm: React.FC<FeaturedProjectsSettingsFormProps> = ({ settings, onChange }) => {
    const handleFieldChange = (field: keyof HomepageFeaturedProjectsSettings, value: any) => {
        onChange({ ...settings, [field]: value });
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="admin-form-group">
                    <label>Tiêu đề phụ</label>
                    <input type="text" value={settings.preTitle || ''} onChange={e => handleFieldChange('preTitle', e.target.value)} />
                </div>
                <div className="admin-form-group">
                    <label>Tiêu đề chính</label>
                    <input type="text" value={settings.title} onChange={e => handleFieldChange('title', e.target.value)} />
                </div>
                <div className="admin-form-group">
                    <label>Nút bấm - Chữ</label>
                    <input type="text" value={settings.buttonText} onChange={e => handleFieldChange('buttonText', e.target.value)} />
                </div>
                <div className="admin-form-group">
                    <label>Nút bấm - Link</label>
                    <input type="text" value={settings.buttonLink} onChange={e => handleFieldChange('buttonLink', e.target.value)} />
                </div>
                <div className="admin-form-group md:col-span-2">
                    <label>IDs Dịch vụ nổi bật (phân cách bằng dấu phẩy)</label>
                    <input 
                        type="text" 
                        value={(settings.featuredServiceIds || []).join(', ')} 
                        onChange={e => handleFieldChange('featuredServiceIds', e.target.value.split(',').map(id => id.trim()))} 
                    />
                     <p className="form-input-description">Ví dụ: svc001, svc002, svc003</p>
                </div>
                <div className="admin-form-group-checkbox items-center">
                    <input type="checkbox" checked={settings.enabled} onChange={e => handleFieldChange('enabled', e.target.checked)} id="fp_enabled"/>
                    <label htmlFor="fp_enabled" className="!mb-0 !ml-2">Hiển thị khối này</label>
                </div>
            </div>
        </div>
    );
};

export default FeaturedProjectsSettingsForm;
